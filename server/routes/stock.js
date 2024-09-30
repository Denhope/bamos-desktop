const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Предполагаем, что у нас есть эти модели
const MaterialStore = require('../models/MaterialStore');
const PartNumber = require('../models/PartNumber');

router.get('/available-quantity', async (req, res) => {
  try {
    const { companyID, alternatives, isAllExpDate, isAlternative, storeID, partNumberID } = req.query;
    
    const query = {};

    // Фильтр по компании
    if (companyID) {
      query.companyID = mongoose.Types.ObjectId(companyID);
    }

    // Фильтр по складам
    if (storeID) {
      query.storeID = { $in: storeID.split(',').map(id => mongoose.Types.ObjectId(id)) };
    }

    // Фильтр по партийному номеру и альтернативам
    if (partNumberID) {
      const partNumbersToCheck = [mongoose.Types.ObjectId(partNumberID)];
      if (isAlternative === 'true') {
        const alternatives = await PartNumber.find({ partNumberID: mongoose.Types.ObjectId(partNumberID) });
        partNumbersToCheck.push(...alternatives.map(alt => alt.altPartNumberID));
      }
      query.partID = { $in: partNumbersToCheck };
    }

    // Фильтр по сроку годности
    if (isAllExpDate !== 'true') {
      query.$or = [
        { PRODUCT_EXPIRATION_DATE: { $exists: false } },
        { PRODUCT_EXPIRATION_DATE: { $gte: new Date() } }
      ];
    }

    const result = await MaterialStore.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$storeID',
          availableQTY: { $sum: '$QUANTITY' },
          storeName: { $first: '$STOCK' },
          unitOfMeasure: { $first: '$UNIT_OF_MEASURE' }
        }
      },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$availableQTY' },
          storeAvailableQTY: {
            $push: {
              storeID: '$_id',
              storeName: '$storeName',
              availableQTY: '$availableQTY'
            }
          },
          unitOfMeasure: { $first: '$unitOfMeasure' }
        }
      },
      {
        $project: {
          _id: 0,
          totalQuantity: 1,
          storeAvailableQTY: 1,
          unitOfMeasure: 1
        }
      }
    ]);

    if (result.length === 0) {
      return res.json({
        totalQuantity: 0,
        storeAvailableQTY: [],
        unitOfMeasure: null
      });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error in getFilteredStockQty:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;