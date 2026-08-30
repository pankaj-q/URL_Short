import URL from '../models/urlModel.js';
import {nanoid} from "nanoid";
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import Click from '../models/clickModel.js';
import {UAParser} from 'ua-parser-js';


const createShortUrl = asyncHandler(async (req ,res) => {
    const { originalUrl, customAlias, exipresIn } = req.body;
    if(!originalUrl){
        throw new ApiError(400, "orignalUrl are required")
    }

    let expiresIn = null;
    if(expiresIn){
        const match =  expiresIn.match(/^(\d+)([mhd])$/);
        if(!match){
            throw new ApiError(409, "invalid expiration formate");
        }

        const value = Number(match[1]);
        const unit = match[2];
        const millisecond =
          unit === "m"
            ? value * 60 * 1000
            : unit === "h"
              ? value * 60 * 60 * 1000
              : value * 24 * 60 * 60 * 1000;
              
       expiresIn = new Date(Date.now()+ millisecond);
    }

    let shortCode;
    if (customAlias) {
      const existingAlias = await URL.findOne({
        shortCode: customAlias,
      });
      if (existingAlias) {
        throw new ApiError(409, "costum alias already exist");
      }
      shortCode = customAlias;
    } else {
      shortCode = nanoid(6);
    }
    const createUrl = await URL.create({
       originalUrl,
       shortCode,
       expiresIn
    })
    console.log("CREATED URL", createUrl);
    res
      .status(201)
      .json(new ApiResponse(201, createUrl, "shorten url created"));
})

  const getAnalytics = asyncHandler (async(req, res) => {
      const {shortCode} = req.params;
      const url = await URL.findOne({shortCode});
      if(!url){
        throw new ApiError(404, "Url not found");
      }
      res.status(200).json(
        new ApiResponse(
          200,
          {
            shortCode: url.shortCode,
            originalUrl: url.originalUrl,
            clicks: url.clicks,
            createdAt: url.createdAt,
            expiresAt: url.expiresAt,
            clickHistory: url.clickHistory
          },
          "URL analytics fetch bro !",
        ),
      );
  });

// const createShortUrl = asyncHandler(async (req, res) => {
//     const { originalUrl, customAlias, expiresIn } = req.body;
//     if(!originalUrl) {
//         throw new ApiError(400, "original url are required");
//     }

//     let expiresAt = null;

//     if(expiresIn){
//         const match = expiresIn.match(/^(\d+)([mhd])$/);
//         if(!match){
//             throw new ApiError(400, "Invalid expiration formate. Use like 1h, 1d, 7d")
//         }
//     const value = Number(match[1]);
//     const unit = match[2];
//     const millisecond = unit === "m" ?  value * 60 * 1000 : unit === "h" ? value *60*60*1000 :value * 24 *60 *60 *1000;
//     expiresAt = new Date(Date.now() + millisecond);
//     }

//     let shortCode;
//     if (customAlias) {
//       const existingAlias = await URL.findOne({
//         shortCode: customAlias,
//       });
//       if (existingAlias) {
//         throw new ApiError(409, "Custom Alias already exist");
//       }
//       shortCode = customAlias;
//     } else {
//       shortCode = nanoid(6);
//     }
//     const url = await URL.create({
//         originalUrl, 
//         shortCode,
//         expiresAt
//     })
//     return res.status(201).json(
//         new ApiResponse(201, url, "URL shortened successfully")
//     );

// });

const getShortenUrl = asyncHandler(async(req,res) => {
    const {shortCode} = req.params;
    console.log("ShortCode", shortCode);
    const url = await URL.findOne({shortCode})
    console.log("FOUND URL", url);
    if (!url) {
      throw new ApiError(404, "URL not found");
    }
    if(url.expiresAt && url.expiresAt <= new Date()){
        throw new ApiError(410, "URL has expired");
    }
    url.clicks += 1;
    const parser = new UAParser(req.get("User-Agent"));
    const browser = parser.getBrowser().type || "unknown";
    const os = parser.getOS().name || "unknown";
    const device = parser.getDevice().name || "chrome";
   
    await Click.create({
      urlId: url._id,
      device,
      browser,
      os,
      country: "unknown",
      referrer:req.get("Referrer"),
      ip: req.ip,
      userAgent: req.get("User-Agent")
    })
    // url.clickHistory.push({
    //     clickedAt : new Date(),
    //     ip : req.ip,
    //     userAgent : req.get("User-Agent"),
    //     referrer: req.get("Referrer")
    // });
    await url.save();

   return res.redirect(url.originalUrl);
})

export { createShortUrl, getShortenUrl, getAnalytics };