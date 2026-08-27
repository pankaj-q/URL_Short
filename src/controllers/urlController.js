import URL from '../models/urlModel.js';
import {nanoid} from "nanoid";
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'

const createShortUrl = asyncHandler(async (req, res) => {
    const { originalUrl, customAlias, expiresIn } = req.body;
    if(!originalUrl) {
        throw new ApiError(400, "original url are required");
    }

    let expiresAt = null;

    if(expiresIn){
        const match = expiresIn.match(/^(\d+)([mhd])$/);
        if(!match){
            throw new ApiError(400, "Invalid expiration formate. Use like 1h, 1d, 7d")
        }
    const value = Number(match[1]);
    const unit = match[2];
    const millisecond = unit === "m" ?  value * 60 * 1000 : unit === "h" ? value *60*60*1000 :value * 24 *60 *60 *1000;
    expiresAt = new Date(Date.now() + millisecond);
    }

    let shortCode;
    if (customAlias) {
      const existingAlias = await URL.findOne({
        shortCode: customAlias,
      });
      if (existingAlias) {
        throw new ApiError(409, "Custom Alias already exist");
      }
      shortCode = customAlias;
    } else {
      shortCode = nanoid(6);
    }
    const url = await URL.create({
        originalUrl, 
        shortCode,
        expiresAt
    })
    return res.status(201).json(
        new ApiResponse(201, url, "URL shortened successfully")
    );

});

const getShortenUrl = asyncHandler(async(req,res) => {
    const {shortCode} = req.params;
    const url = await URL.findOne({shortCode})
    if (!url) {
      throw new ApiError(404, "URL not found");
    }
    if(url.expiresAt && url.expiresAt <= new Date()){
        throw new ApiError(410, "URL has expired");
    }
    url.clicks += 1;
    await url.save();

   return res.redirect(url.originalUrl);
})

export { createShortUrl , getShortenUrl};