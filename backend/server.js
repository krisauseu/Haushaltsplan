require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send('Haushaltsplan Backend is running. Please access the frontend at http://localhost:5173');
});

// Helper function to decode JWT and extract user_id
const decodeJWT = (token) => {
  try {
    const base64Payload = token.split('.')[1];
    const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
};

// Auth Middleware & Supabase Client Factory
app.use((req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    // Create authenticated client for this request
    req.supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Extract user_id from token for RLS
    const decoded = decodeJWT(token);
    req.userId = decoded?.sub; // 'sub' contains the user UUID in Supabase JWTs
  } else {
    // Fallback to anonymous client (will likely be blocked by RLS)
    req.supabase = createClient(supabaseUrl, supabaseKey);
    req.userId = null;
  }
  next();
});

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await req.supabase.from('categories').select('id').limit(1);
    if (error) throw error;
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    // Keep 200 OK for health check even if db is empty or RLS blocks
    res.json({ status: 'healthy_but_unauthorized', error: error.message, timestamp: new Date().toISOString() });
  }
});

// =====================================================
// CATEGORIES ENDPOINTS
// =====================================================

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('categories')
      .select('*')
      .order('type', { ascending: false })
      .order('display_order', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create new category
app.post('/api/categories', async (req, res) => {
  const { name, type, is_fixed, display_order } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { data, error } = await req.supabase
      .from('categories')
      .insert([{
        name,
        type,
        is_fixed: is_fixed ?? true,
        display_order: display_order ?? 0,
        user_id: req.userId
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, is_fixed, display_order } = req.body;
  try {
    const { data, error } = await req.supabase
      .from('categories')
      .update({ name, type, is_fixed, display_order })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await req.supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted', category: data });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// =====================================================
// MONTHLY VALUES ENDPOINTS
// =====================================================

// Get all values for a year
app.get('/api/values/:year', async (req, res) => {
  const { year } = req.params;
  const { scenarioId } = req.query;

  try {
    // Get all categories
    const { data: categories, error: catError } = await req.supabase
      .from('categories')
      .select('*')
      .order('type', { ascending: false })
      .order('display_order', { ascending: true });

    if (catError) throw catError;

    // Route to correct table based on scenarioId
    const valuesTable = scenarioId ? 'scenario_values' : 'monthly_values';
    let valuesQuery = req.supabase
      .from(valuesTable)
      .select('*')
      .eq('year', parseInt(year));

    if (scenarioId) {
      valuesQuery = valuesQuery.eq('scenario_id', scenarioId);
    }

    const { data: values, error: valError } = await valuesQuery;

    if (valError) throw valError;

    // Transform to expected format
    const result = categories.map(category => {
      const categoryValues = values
        .filter(v => v.category_id === category.id)
        .map(v => ({ month: v.month, amount: parseFloat(v.amount) }))
        .sort((a, b) => a.month - b.month);

      return {
        category_id: category.id,
        name: category.name,
        type: category.type,
        is_fixed: category.is_fixed,
        display_order: category.display_order,
        monthly_values: categoryValues
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching values:', error);
    res.status(500).json({ error: 'Failed to fetch values' });
  }
});

// Update a single monthly value
app.put('/api/values', async (req, res) => {
  const { category_id, year, month, amount, scenario_id } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Route to correct table
    const valuesTable = scenario_id ? 'scenario_values' : 'monthly_values';
    const upsertData = scenario_id
      ? { category_id, year, month, amount, user_id: req.userId, scenario_id }
      : { category_id, year, month, amount, user_id: req.userId };

    // Conflict columns differ per table
    const conflictColumns = scenario_id
      ? 'scenario_id,category_id,year,month'
      : 'category_id,year,month';

    const { data, error } = await req.supabase
      .from(valuesTable)
      .upsert(upsertData, { onConflict: conflictColumns })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating value:', error);
    res.status(500).json({ error: 'Failed to update value' });
  }
});

// Batch update monthly values
app.put('/api/values/batch', async (req, res) => {
  const { updates } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Check if this is for scenario or live data
    const scenario_id = updates[0]?.scenario_id || null;
    const valuesTable = scenario_id ? 'scenario_values' : 'monthly_values';

    const upsertData = updates.map(u => scenario_id
      ? {
        category_id: u.category_id,
        year: u.year,
        month: u.month,
        amount: u.amount,
        user_id: req.userId,
        scenario_id: u.scenario_id
      }
      : {
        category_id: u.category_id,
        year: u.year,
        month: u.month,
        amount: u.amount,
        user_id: req.userId
      }
    );

    const conflictColumns = scenario_id
      ? 'scenario_id,category_id,year,month'
      : 'category_id,year,month';

    const { data, error } = await req.supabase
      .from(valuesTable)
      .upsert(upsertData, { onConflict: conflictColumns })
      .select();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error batch updating values:', error);
    res.status(500).json({ error: 'Failed to batch update values' });
  }
});

// =====================================================
// SUMMARY ENDPOINT
// =====================================================

// Get yearly summary with calculations
app.get('/api/summary/:year', async (req, res) => {
  const { year } = req.params;
  const { scenarioId } = req.query;

  try {
    // Get all categories
    const { data: categories, error: catError } = await req.supabase
      .from('categories')
      .select('*');

    if (catError) throw catError;

    // Route to correct table
    const valuesTable = scenarioId ? 'scenario_values' : 'monthly_values';
    let valuesQuery = req.supabase
      .from(valuesTable)
      .select('*')
      .eq('year', parseInt(year));

    if (scenarioId) {
      valuesQuery = valuesQuery.eq('scenario_id', scenarioId);
    }

    const { data: values, error: valError } = await valuesQuery;

    if (valError) throw valError;

    // Create category lookup
    const categoryMap = {};
    categories.forEach(c => { categoryMap[c.id] = c; });

    // Calculate totals
    const incomeByMonth = {};
    const expenseFixedByMonth = {};
    const expenseVariableByMonth = {};
    let yearlyIncome = 0;
    let yearlyExpenseFixed = 0;
    let yearlyExpenseVariable = 0;

    values.forEach(v => {
      const category = categoryMap[v.category_id];
      if (!category) return;

      const amount = parseFloat(v.amount);

      if (category.type === 'income') {
        incomeByMonth[v.month] = (incomeByMonth[v.month] || 0) + amount;
        yearlyIncome += amount;
      } else if (category.is_fixed) {
        expenseFixedByMonth[v.month] = (expenseFixedByMonth[v.month] || 0) + amount;
        yearlyExpenseFixed += amount;
      } else {
        expenseVariableByMonth[v.month] = (expenseVariableByMonth[v.month] || 0) + amount;
        yearlyExpenseVariable += amount;
      }
    });

    // Calculate monthly balances
    const monthlyBalances = {};
    for (let m = 1; m <= 12; m++) {
      const income = incomeByMonth[m] || 0;
      const expenseFixed = expenseFixedByMonth[m] || 0;
      const expenseVariable = expenseVariableByMonth[m] || 0;
      monthlyBalances[m] = income - expenseFixed - expenseVariable;
    }

    res.json({
      year: parseInt(year),
      incomeByMonth,
      expenseFixedByMonth,
      expenseVariableByMonth,
      monthlyBalances,
      yearlyTotals: {
        income: yearlyIncome,
        expenseFixed: yearlyExpenseFixed,
        expenseVariable: yearlyExpenseVariable,
        totalExpense: yearlyExpenseFixed + yearlyExpenseVariable,
        balance: yearlyIncome - yearlyExpenseFixed - yearlyExpenseVariable
      }
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// =====================================================
// SCENARIOS ENDPOINTS
// =====================================================

// Get all scenarios for a user and year
app.get('/api/scenarios/:year', async (req, res) => {
  const { year } = req.params;

  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { data, error } = await req.supabase
      .from('scenarios')
      .select('*')
      .eq('year', parseInt(year))
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({ error: 'Failed to fetch scenarios' });
  }
});

// Create a new scenario
app.post('/api/scenarios', async (req, res) => {
  const { name, year, copyFromLive } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!name || !year) {
    return res.status(400).json({ error: 'Name and year are required' });
  }

  try {
    // Create scenario
    const { data: scenario, error: scenarioError } = await req.supabase
      .from('scenarios')
      .insert([{
        name,
        year: parseInt(year),
        user_id: req.userId
      }])
      .select()
      .single();

    if (scenarioError) throw scenarioError;

    // Copy from live if requested
    if (copyFromLive) {
      const { data: liveValues, error: liveError } = await req.supabase
        .from('monthly_values')
        .select('*')
        .eq('year', parseInt(year));

      if (liveError) throw liveError;

      if (liveValues && liveValues.length > 0) {
        const scenarioValues = liveValues.map(v => ({
          category_id: v.category_id,
          year: v.year,
          month: v.month,
          amount: v.amount,
          user_id: req.userId,
          scenario_id: scenario.id
        }));

        const { error: insertError } = await req.supabase
          .from('scenario_values')
          .insert(scenarioValues);

        if (insertError) throw insertError;
      }
    }

    res.status(201).json(scenario);
  } catch (error) {
    console.error('Error creating scenario:', error);
    res.status(500).json({ error: 'Failed to create scenario' });
  }
});

// Update a scenario
app.patch('/api/scenarios/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { data, error } = await req.supabase
      .from('scenarios')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating scenario:', error);
    res.status(500).json({ error: 'Failed to update scenario' });
  }
});

// Delete a scenario
app.delete('/api/scenarios/:id', async (req, res) => {
  const { id } = req.params;

  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { error } = await req.supabase
      .from('scenarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting scenario:', error);
    res.status(500).json({ error: 'Failed to delete scenario' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Haushaltsplan Backend running on port ${PORT}`);
  console.log(`📊 Connected to Supabase: ${supabaseUrl}`);
});
