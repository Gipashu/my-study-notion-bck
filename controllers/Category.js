// const Category = require("../models/Category");

// exports.createCategory = async (req, res) => {
// 	try {
// 		const { name, description } = req.body;
// 		if (!name) {
// 			return res
// 				.status(400)
// 				.json({ success: false, message: "All fields are required" });
// 		}
// 		const CategorysDetails = await Category.create({
// 			name: name,
// 			description: description,
// 		});
// 		console.log(CategorysDetails);
// 		return res.status(200).json({
// 			success: true,
// 			message: "Categorys Created Successfully",
// 		});
// 	} catch (error) {
// 		return res.status(500).json({
// 			success: true,
// 			message: error.message,
// 		});
// 	}
// };

// exports.showAllCategories = async (req, res) => {
// 	try {
// 		const allCategorys = await Category.find(
// 			{},
// 			{ name: true, description: true }
// 		);
//         // console.log("categorrry", allCategorys);
// 		res.status(200).json({
// 			success: true,
// 			data: allCategorys,
// 		});
// 	} catch (error) {
// 		return res.status(500).json({
// 			success: false,
// 			message: error.message,
// 		});
// 	}
// };

// exports.categoryPageDetails = async (req, res) => {
//     try {
//             //get categoryId
//             const {categoryId} = req.body;
//             //get courses for specified categoryId
//             const selectedCategory = await Category.findById(categoryId)
//                                             .populate("courses")
//                                             .exec();
//             //validation
//             if(!selectedCategory) {
//                 return res.status(404).json({
//                     success:false,
//                     message:'Data Not Found',
//                 });
//             }
//             //get coursesfor different categories
//             const differentCategories = await Category.find({
//                                          _id: {$ne: categoryId},
//                                          })
//                                          .populate("courses")
//                                          .exec();

//             //get top 10 selling courses
//             //HW - write it on your own

//             //return response
//             return res.status(200).json({
//                 success:true,
//                 data: {
//                     selectedCategory,
//                     differentCategories,
//                 },
//             });

//     }
//     catch(error ) {
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message:error.message,
//         });
//     }
// };




const Category = require("../models/Category");
const Course = require("../models/Course");

exports.createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log(CategorysDetails);
		return res.status(200).json({
			success: true,
			message: "Categorys Created Successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: true,
			message: error.message,
		});
	}
};

exports.showAllCategories = async (req, res) => {
	try {
		const allCategorys = await Category.find(
			{},
			{ name: true, description: true }
		);
		res.status(200).json({
			success: true,
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.categoryPageDetails = async (req, res) => {
	try {
		const { categoryId } = req.body;
            // console.log("categorypage detalis" ,categoryId)
		// Get courses for the specified category
		const selectedCategory = await Category.findById(categoryId) //populate instuctor and rating and reviews from courses
			.populate({
				path: "courses",
				match: { status: "Published" },
				populate: [{ path: "instructor" }, { path: "ratingAndReviews" }],
			})
			.exec();
		// console.log("hello hello",selectedCategory);
		// Handle the case when the category is not found
		if (!selectedCategory) {
			console.log("Category not found.");
			return res
				.status(404)
				.json({ success: false, message: "Category not found" });
		}
		// Handle the case when there are no courses
		if (selectedCategory.courses.length === 0) {
			console.log("No courses found for the selected category.");
			return res.status(404).json({
				success: false,
				message: "No courses found for the selected category.",
			});
		}

		const selectedCourses = selectedCategory.courses;

		// Get courses for other categories
		const categoriesExceptSelected = await Category.find({
			_id: { $ne: categoryId },
		}).populate({
			path: "courses",
			match: { status: "Published" },
			populate: [{ path: "instructor" }, { path: "ratingAndReviews" }],
		});
		let differentCourses = [];
		for (const category of categoriesExceptSelected) {
			differentCourses.push(...category.courses);
		}

		// Get top-selling courses across all categories
		const allCategories = await Category.find().populate({
			path: "courses",
			match: { status: "Published" },
			populate: [{ path: "instructor" }, { path: "ratingAndReviews" }],
		});
        // console.log("all courses tak pahuche", allCategories);
		const allCourses = allCategories.flatMap((category) => category.course);
		const mostSellingCourses = allCourses
			.sort((a, b) => b.sold - a.sold)
			.slice(0, 10);

		res.status(200).json({
			selectedCourses: selectedCourses,
			differentCourses: differentCourses,
			mostSellingCourses: mostSellingCourses,
			success: true,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};
exports.addCourseToCategory = async (req, res) => {
	const { courseId, categoryId } = req.body;
	console.log("category id", courseId);
	try {
        const category = await Category.findById(categoryId);
        // console.log("category" ,category)
		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}
        // console("This is categroy" ,category);
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({
				success: false,
				message: "Course not found",
			});
		}
        // console.log("course it iss", category.Course.includes(courseId));
		if (category.courses.includes(courseId)) {
			return res.status(200).json({
				success: true,
				message: "Course already exists in the category",
			});
		}
		category.courses.push(courseId);
		await category.save();
		return res.status(200).json({
			success: true,
			message: "Course added to category successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

