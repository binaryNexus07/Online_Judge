export const validate = (schema, source = "body") => {
    return (req, res, next) => {

        console.log("🔥 VALIDATE MIDDLEWARE HIT");
        console.log("SOURCE:", source);
        console.log("DATA:", req[source]);

        const result = schema.safeParse(req[source]);

        if (!result.success) {
            console.log("❌ VALIDATION FAILED:", result.error.issues);

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message
                }))
            });
        }

        req.validated = req.validated || {};
        req.validated[source] = result.data;

        console.log("✅ VALIDATION PASSED");

        next();
    };
};