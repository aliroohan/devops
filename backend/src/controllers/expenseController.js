import Expense from '../models/Expense.js';

// @desc    Get all expenses for logged-in user
// @route   GET /api/expenses
export const getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, sort = '-date' } = req.query;

    const filter = { userId: req.user._id };

    if (category) {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter).sort(sort);

    res.json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
export const createExpense = async (req, res, next) => {
  try {
    const { amount, category, description, date } = req.body;

    const expense = await Expense.create({
      userId: req.user._id,
      amount,
      category,
      description,
      date: date || Date.now(),
    });

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
export const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Make sure user owns the expense
    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this expense',
      });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Make sure user owns the expense
    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this expense',
      });
    }

    await expense.deleteOne();

    res.json({
      success: true,
      message: 'Expense deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
export const getExpenseStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Total spending this month
    const monthlyTotal = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Breakdown by category (this month)
    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Spending trends - last 6 months
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyTrends = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Recent expenses (last 5)
    const recentExpenses = await Expense.find({ userId })
      .sort('-date')
      .limit(5);

    // All time total
    const allTimeTotal = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        monthlyTotal: monthlyTotal[0] || { total: 0, count: 0 },
        allTimeTotal: allTimeTotal[0] || { total: 0, count: 0 },
        categoryBreakdown: categoryBreakdown.map((c) => ({
          category: c._id,
          total: c.total,
          count: c.count,
        })),
        monthlyTrends: monthlyTrends.map((m) => ({
          month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
          total: m.total,
          count: m.count,
        })),
        recentExpenses,
      },
    });
  } catch (error) {
    next(error);
  }
};
