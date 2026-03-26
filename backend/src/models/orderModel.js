const pool = require('../config/db');

/**
 * CREATE ORDER TABLES
 */
const createOrderTable = async () => {
  const queryOrders = `
      CREATE TABLE IF NOT EXISTS orders (
        orderid SERIAL PRIMARY KEY,
        userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
        totalamount NUMERIC(10, 2) NOT NULL,
        shippingaddress TEXT NOT NULL,
        paymentmethod VARCHAR(50) DEFAULT 'eSewa',
        paymentstatus VARCHAR(50) DEFAULT 'Completed',
        orderstatus VARCHAR(50) DEFAULT 'Processing',
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

  const queryOrderItems = `
      CREATE TABLE IF NOT EXISTS order_items (
        orderitemid SERIAL PRIMARY KEY,
        orderid INTEGER REFERENCES orders(orderid) ON DELETE CASCADE,
        medicineid INTEGER REFERENCES medicines(medicineid) ON DELETE SET NULL,
        quantity INTEGER NOT NULL,
        price NUMERIC(10, 2) NOT NULL
      );
    `;

  try {
    await pool.query(queryOrders);
    await pool.query(queryOrderItems);
    console.log("Orders tables created successfully.");
  } catch (err) {
    console.error("Error creating orders tables:", err);
  }
};

/**
 * CREATE A NEW ORDER
 */
const createOrder = async (userId, totalAmount, shippingAddress, items) => {
  const client = await pool.connect();
  try {
    // 1. Start transaction
    await client.query('BEGIN');

    // 2. Insert into orders table
    const orderResult = await client.query(
      `INSERT INTO orders (userid, totalamount, shippingaddress)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, totalAmount, shippingAddress]
    );
    const newOrder = orderResult.rows[0];

    // 3. Insert into order_items table and reduce stock
    for (const item of items) {
      // Find the medicine price (optional safety check, we'll just trust the frontend price for now or look it up)
      // For precision, ideally we check real DB price, but we will use item.price passed from cart
      await client.query(
        `INSERT INTO order_items (orderid, medicineid, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [newOrder.orderid, item.medicineid, item.quantity, item.price]
      );

      // Reduce stock safely (prevent negative stock on checkout)
      await client.query(
        `UPDATE medicines SET stock = GREATEST(stock - $1, 0) WHERE medicineid = $2`,
        [item.quantity, item.medicineid]
      );
    }

    // 4. Commit transaction
    await client.query('COMMIT');
    return newOrder;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * GET ORDERS FOR SPECIFIC USER
 */
const getUserOrders = async (userId) => {
  const query = `
    SELECT 
      o.orderid, o.totalamount, o.shippingaddress, o.paymentmethod, o.paymentstatus, o.orderstatus, o.createdat,
      json_agg(
        json_build_object(
          'orderitemid', oi.orderitemid,
          'medicineid', oi.medicineid,
          'name', m.name,
          'imageurl', m.imageurl,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) AS items
    FROM orders o
    LEFT JOIN order_items oi ON o.orderid = oi.orderid
    LEFT JOIN medicines m ON oi.medicineid = m.medicineid
    WHERE o.userid = $1
    GROUP BY o.orderid
    ORDER BY o.createdat DESC;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

/**
 * GET ALL ORDERS FOR ADMIN
 * Supports: ?search=text (orderId, username, email)
 */
const getAllOrders = async (search = '') => {
  let query = `
    SELECT 
      o.orderid, o.totalamount, o.shippingaddress, o.paymentmethod, o.paymentstatus, o.orderstatus, o.createdat,
      u.fullname as username, u.email as useremail, u.phone as userphone,
      json_agg(
        json_build_object(
          'orderitemid', oi.orderitemid,
          'medicineid', oi.medicineid,
          'name', m.name,
          'imageurl', m.imageurl,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) AS items
    FROM orders o
    LEFT JOIN users u ON o.userid = u.userid
    LEFT JOIN order_items oi ON o.orderid = oi.orderid
    LEFT JOIN medicines m ON oi.medicineid = m.medicineid
  `;

  const values = [];
  if (search) {
    // If search is a number, try matching orderid
    const isNum = !isNaN(search);
    if (isNum) {
      query += ` WHERE o.orderid = $1 OR u.fullname ILIKE $2 OR u.email ILIKE $2`;
      values.push(parseInt(search), `%${search}%`);
    } else {
      query += ` WHERE u.fullname ILIKE $1 OR u.email ILIKE $1`;
      values.push(`%${search}%`);
    }
  }

  query += ` GROUP BY o.orderid, u.userid ORDER BY o.createdat DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * UPDATE ORDER STATUS
 */
const updateOrderStatus = async (orderId, newStatus) => {
  const query = `
    UPDATE orders
    SET orderstatus = $1
    WHERE orderid = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [newStatus, orderId]);
  return result.rows[0];
};

module.exports = {
  createOrderTable,
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
};
