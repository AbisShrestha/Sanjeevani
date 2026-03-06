const medicineModel = require('../models/medicineModel');
const fs = require('fs');
const path = require('path');

/* 
   ADMIN: ADD MEDICINE
   This function receives data from the App and saves it to the Database.
*/
const addMedicine = async (req, res) => {
  try {
    // 1. Get all the details from the "Request Body" (what the app sent us)
    const {
      name,
      categoryId,
      description,
      dosage,
      benefits,
      usageInstructions,
      precautions,
      price,
      stock,
      lowStockThreshold,
      imageUrl,
    } = req.body;


    // 2. Strict Validation
    const errors = [];
    if (!name || name.trim().length < 3) errors.push('Name must be at least 3 characters');
    if (!categoryId) errors.push('Category is required');
    if (!price || Number(price) <= 0) errors.push('Price must be greater than 0');
    if (stock !== undefined && Number(stock) < 0) errors.push('Stock cannot be negative');
    if (!imageUrl) errors.push('Image is required');

    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(', ') });
    }



    // 4. Organize the data nicely before saving
    const medicineData = {
      name: name.trim(),
      categoryId: categoryId ? Number(categoryId) : null,
      description: description ?? null,
      dosage: dosage ?? null,
      benefits: benefits ?? null,
      usageInstructions: usageInstructions ?? null,
      precautions: precautions ?? null,
      price: Number(price),
      stock: stock !== undefined ? Number(stock) : 0,
      lowStockThreshold:
        lowStockThreshold !== undefined
          ? Number(lowStockThreshold)
          : 10,
      imageUrl: imageUrl ?? null,
    };

    // Helper to prevent "Bad Paths" forever
    const sanitizeImageUrl = (url) => {
      if (!url) return null;
      // 1. Replace Windows backslashes
      let clean = url.replace(/\\/g, '/');

      // 2. Strip absolute paths (keep only from "uploads/" onwards)
      if (clean.includes('uploads/')) {
        clean = clean.substring(clean.indexOf('uploads/'));
      }

      // 3. Ensure it doesn't start with a slash (relative path for DB)
      if (clean.startsWith('/')) {
        clean = clean.substring(1);
      }

      return clean;
    };

    // 5. Ask the "Model" (Database helper) to save it
    // Sanitize image URL one last time before DB
    medicineData.imageUrl = sanitizeImageUrl(medicineData.imageUrl);

    const newMedicine = await medicineModel.createMedicine(medicineData);

    // 6. Send a "Success" message back to the App
    res.status(201).json({
      message: 'Medicine added successfully',
      data: newMedicine,
    });
  } catch (error) {
    // 7. If something crashed, tell the App "Internal Server Error"
    console.error('Error adding medicine:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        message: 'Invalid category selected',
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

/* 
   GET ALL MEDICINES
*/
const getMedicines = async (req, res) => {
  try {
    const medicines = await medicineModel.getAllMedicines();
    res.json(medicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch medicines' });
  }
};

/* 
   GET SINGLE MEDICINE
*/
const getMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;

    const medicine = await medicineModel.getMedicineById(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json(medicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch medicine' });
  }
};

/* 
   ADMIN: UPDATE MEDICINE
*/
const updateMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;

    const {
      name,
      categoryId,
      description,
      dosage,
      benefits,
      usageInstructions,
      precautions,
      price,
      stock,
      lowStockThreshold,
      imageUrl,
    } = req.body;



    const updateData = {
      name: name?.trim(),
      categoryId: categoryId ? Number(categoryId) : null,
      description: description ?? null,
      dosage: dosage ?? null,
      benefits: benefits ?? null,
      usageInstructions: usageInstructions ?? null,
      precautions: precautions ?? null,
      price: price !== undefined ? Number(price) : null,
      stock: stock !== undefined ? Number(stock) : null,
      lowStockThreshold:
        lowStockThreshold !== undefined
          ? Number(lowStockThreshold)
          : null,
      imageUrl: imageUrl ?? null,
    };

    const updated = await medicineModel.updateMedicine(
      medicineId,
      updateData
    );

    if (!updated) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({ message: 'Medicine updated successfully' });
  } catch (error) {
    console.error('UPDATE MEDICINE ERROR >>>', error);
    res.status(500).json({ message: 'Failed to update medicine' });
  }
};

/* 
   ADMIN: UPDATE STOCK
*/
const updateStock = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const stock = Number(req.body.stock);

    if (isNaN(stock) || stock < 0) {
      return res
        .status(400)
        .json({ message: 'Stock must be a positive number' });
    }

    const updated = await medicineModel.updateStock(medicineId, stock);
    if (!updated) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update stock' });
  }
};

/* 
   ADMIN: PERMANENT DELETE MEDICINE
*/
const deleteMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;

    // 1. Get Medicine Details First (to find image)
    const medicine = await medicineModel.getMedicineById(medicineId);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // 2. Delete Image File if it exists (and is local)
    if (medicine.imageurl && !medicine.imageurl.startsWith('http')) {
      try {
        // Extract filename from path (e.g. /uploads/image.jpg -> image.jpg)
        const filename = path.basename(medicine.imageurl);
        const filePath = path.join(__dirname, '../../uploads', filename);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted image file: ${filePath}`);
        }
      } catch (err) {
        console.error("Failed to delete image file:", err);
        // Continue to delete info from DB even if file delete fails
      }
    }

    // 3. Delete from Database
    const deleted = await medicineModel.deleteMedicine(medicineId);

    if (!deleted) {
      return res.status(404).json({ message: 'Medicine not found during deletion' });
    }

    res.json({ message: 'Medicine and image permanently deleted' });
  } catch (error) {
    console.error('DELETE MEDICINE ERROR >>>', error);
    res.status(500).json({ message: 'Failed to delete medicine' });
  }
};

/* 
   ADMIN: LOW STOCK
*/
const getLowStockMedicines = async (req, res) => {
  try {
    const medicines = await medicineModel.getLowStockMedicines();
    res.json(medicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch low stock medicines' });
  }
};

module.exports = {
  addMedicine,
  getMedicines,
  getMedicine,
  updateMedicine,
  updateStock,
  deleteMedicine,
  getLowStockMedicines,
};
