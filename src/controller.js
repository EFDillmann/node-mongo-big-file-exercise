const Records = require("./records.model");
const { processCsvFile } = require("./service");

const upload = async (req, res) => {
    const { file } = req;

    if (!file) {
        return res.status(400).json({ message: "No file uploaded." });
    }

    try {
        await processCsvFile(file.path);
        return res.status(200).json({
            message: "File processed and records saved successfully.",
        });
    } catch (err) {
        console.error("Failed to process file:", err);
        return res.status(500).json({
            message: "An error occurred during file processing.",
            error: err.message,
        });
    }
};

const list = async (_, res) => {
    try {
        const data = await Records.find({}).limit(10).lean();

        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json(err);
    }
};

module.exports = {
    upload,
    list,
};
