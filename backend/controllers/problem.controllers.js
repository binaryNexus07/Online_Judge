import { Problem } from "../schema/problem.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const createProblem = async (req, res) => {
    try {
        const {
            title,
            description,
            slug,
            constraints,
            examples,
            codeTemplate,
            solution,
            functionName,
            parameterTypes,
            timeLimit,
            memoryLimit,
            difficulty,
            tags,
        } = req.validated.body;
        
        const existingProblem = await Problem.findOne({ $or: [{ slug }, { title }] });
        if (existingProblem) {
            return sendError(res, 400, "Problem with this slug or title already exists");
        }
        
        const problem = new Problem({
            title,
            description,
            slug,
            constraints,
            examples,
            codeTemplate,
            solution,
            functionName,
            parameterTypes,
            timeLimit,
            memoryLimit,
            difficulty,
            tags,
        });
        await problem.save();
        return sendSuccess(res, 201, "Problem created successfully", problem);
        
    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Internal server error");
    }
}


export const getAllProblem = async (req, res) => {
    try {

        const {
            page,
            limit,
            title,
            slug,
            difficulty,
            tags
        } = req.validated.query;

        const skip = (page - 1) * limit;

        const query = {};

        if (title) {
            query.title = {
                $regex: title,
                $options: "i"
            };
        }

        if (slug) {
            query.slug = slug;
        }

        if (difficulty) {
            query.difficulty = difficulty;
        }

        if (tags) {
            query.tags = { $in: tags };
        }

        const problems = await Problem.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .select("-__v");

        const totalProblem =
            await Problem.countDocuments(query);

        return sendSuccess(
            res,
            200,
            "Problems retrieved successfully",
            {
                problems,
                pagination: {
                    totalProblem,
                    currentPage: page,
                    totalPages: Math.ceil(
                        totalProblem / limit
                    ),
                    limit
                }
            }
        );

    } catch (error) {
        console.error(error);

        return sendError(
            res,
            500,
            "Internal server error"
        );
    }
};

export const getProblemBySlug=async(req,res)=>{
    try{
        const {slug}=req.validated.params;
        const problem=await Problem.findOne({
            slug:slug.toLowerCase().trim()
        }).lean();
        if(!problem){
            return sendError(res,404,"Problem not found");
        }
        return sendSuccess(res,200,"Problem retrieved successfully",problem);
    }catch(error){
        console.error("error in fetching problem by slug",error);
        return sendError(res,500,"Internal server error");
    }
}

export const updateProblem = async (req, res) => {
    try {
        const { id } = req.validated.params;
        const updateData = { ...req.validated.body };

        if (updateData.title) {
            updateData.slug = updateData.title
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-");

            const existingTitle = await Problem.findOne({
                title: updateData.title,
                _id: { $ne: id }
            });

            if (existingTitle) {
                return sendError(
                    res,
                    409,
                    "Problem title already exists"
                );
            }

            const existingSlug = await Problem.findOne({
                slug: updateData.slug,
                _id: { $ne: id }
            });

            if (existingSlug) {
                return sendError(
                    res,
                    409,
                    "Problem slug already exists"
                );
            }
        }

        const updatedProblem =
            await Problem.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            ).select("-__v");

        if (!updatedProblem) {
            return sendError(
                res,
                404,
                "Problem not found"
            );
        }

        return sendSuccess(
            res,
            200,
            "Problem updated successfully",
            updatedProblem
        );

    } catch (error) {
        console.error(
            "Error updating problem:",
            error
        );

        if (error.code === 11000) {
            return sendError(
                res,
                409,
                "Title or slug already exists"
            );
        }

        return sendError(
            res,
            500,
            "Internal server error"
        );
    }
};

export const deleteProblem = async (req, res) => {
    try {
        const { id } = req.validated.params;
        const deletedProblem = await Problem.findByIdAndDelete(id);
        if (!deletedProblem) {
            return sendError(res, 404, "Problem not found");
        }
        return sendSuccess(res, 200, "Problem deleted successfully", deletedProblem);
    } catch (error) {
        console.error("Error deleting problem:", error);
        return sendError(res, 500, "Internal server error");
    }
};

