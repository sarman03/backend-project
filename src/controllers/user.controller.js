import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req,res) => {

    const {fullName, email, username, password} = req.body
    console.log("email ", email)

    if(
        [fullName, email, username, password].some( (field) => field?.trim() === "" )
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{email}, {username}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

   const avatarLocalPath= req.files?.avatar[0]?.path;
   const coverImageLocalPath=  req.files?.coverImage[0]?.path;

   if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
   }

   const user= User.create({
         fullName,
         avatar: avatar.url,
         coverImage: coverImage?.url || "",
         email,
         password,
         username:username.toLowerCase()
   })

   const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
   }

   return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
   )

})

export {registerUser}











    //get user details frontend
    //validation-not empty
    //check if user exists:username+email
    //check for images+avatar
    //upload to cloudinary,avatar
    //create user object-create entry in db
    //remove passs and refresh token from response
    //check for user creation
    //send response