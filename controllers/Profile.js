const Profile = require("../models/Profile");
const User = require("../models/User");
const Course=require("../models/Course")

const { uploadImageToCloudinary } = require("../utils/imageUploader");
// we have already created a null user thus we just need to update the null profile 
// Method for updating a profile
// exports.updateProfile = async (req, res) => {
// 	// console.log("this is formdata", req.body.dateOfBirth);
// 	try {
// 		// fetch data
// 		const {
// 			firstName = "",
// 			lastName = "",
// 			dateOfBirth = "",
// 			about = "",
// 			contactNumber = "",
// 			gender = "",
// 		} = req.body;
// 		// get userId
// 		const id = req.user.id;

// 		// Find the profile by id
// 		const userDetails = await User.findById(id);
// 		const profileDetails = await Profile.findById(
// 			userDetails.additionalDetails
// 		);

// 		const user = await User.findByIdAndUpdate(id, { firstName, lastName });
// 		await user.save();

// 		// Update the profile
// 		profileDetails.dateOfBirth = dateOfBirth;
// 		profileDetails.about = about;
// 		profileDetails.contactNumber = contactNumber;
// 		profileDetails.gender = gender;

// 		// Save the updated profile
// 		await profileDetails.save();

// 		return res.json({
// 			success: true,
// 			message: "Profile updated successfully",
// 			profile,
// 		});
// 	} catch (error) {
// 		console.log(error);
// 		return res.status(500).json({
// 			success: false,
// 			error: error.message,
// 		});
// 	}
// };
// updating a profile
exports.updateProfile = async (req, res) => {
	try {
		// fetch data
		const {
			firstName = "",
			lastName = "",
			dateOfBirth = "",
			about = "",
			contactNumber = "",
			gender = "",
		} = req.body;
		// get userId
		const id = req.user.id;

		// Find the profile by id
		const userDetails = await User.findById(id);
		const profileDetails = await Profile.findById(
			userDetails.additionalDetails
		);

		const user = await User.findByIdAndUpdate(id, { firstName, lastName });
		await user.save();

		// Update the profile
		profileDetails.dateOfBirth = dateOfBirth;
		profileDetails.about = about;
		profileDetails.contactNumber = contactNumber;
		profileDetails.gender = gender;

		// Save the updated profile
		await profileDetails.save();

		// Find the updated user details
		const updatedUserDetails = await User.findById(id)
			.populate("additionalDetails")
			.exec();

		// return res
		return res.json({
			success: true,
			message: "Profile updated successfully",
			updatedUserDetails,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			message: "Issue in updating the profile",
		});
	}
};

exports.deleteAccount = async (req, res) => {
	try {
		// TODO: Find More on Job Schedule
		// const job = schedule.scheduleJob("10 * * * * *", function () {
		// 	console.log("The answer to life, the universe, and everything!");
		// });
		// console.log(job);
		console.log("Printing ID: ", req.user.id);
		const id = req.user.id;
		
		const user = await User.findById({ _id: id });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}
		// Delete Assosiated Profile with the User
		await Profile.findByIdAndDelete({ _id: user.additionalDetails });
		// TODO: Unenroll User From All the Enrolled Courses
		// Now Delete User
		await User.findByIdAndDelete({ _id: id });
		res.status(200).json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (error) {
		console.log(error);
		res
			.status(500)
			.json({ success: false, message: "User Cannot be deleted successfully" });
	}
};

exports.getUserDetails = async (req, res) => {
	try {
		const id = req.user.id;
		const userDetails = await User.findById({_id:id})
			.populate("additionalDetails")
			.exec();
		console.log(userDetails);
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: userDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
exports.instructorDashboard = async (req, res) => {
	try {
	  const courseDetails = await Course.find({ instructor: req.user.id })
		// console.log("course detauks" ,courseDetails)
	  const courseData = courseDetails.map((course) => {
		// const totalStudentsEnrolled = course.studentsEnrolled?.length
		const totalStudentsEnrolled = course.studentsEnrolled?.length ?? 0;
		const totalAmountGenerated = totalStudentsEnrolled * course.price
  
		// Create a new object with the additional fields
		const courseDataWithStats = {
		  _id: course._id,
		  courseName: course.courseName,
		  courseDescription: course.courseDescription,
		  // Include other course properties as needed
		  totalStudentsEnrolled,
		  totalAmountGenerated,
		}
  
		return courseDataWithStats
	  })
  
	  res.status(200).json({ courses: courseData, })
	} catch (error) {
	  console.error(error)
	  res.status(500).json({ message: "Server Error" })
	}
  }