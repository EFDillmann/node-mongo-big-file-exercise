const fs = require("fs");
const csv = require("csv-parser");
const Records = require("./records.model");

const BATCH_SIZE = process.env.BATCH_SIZE || 1000;

/**
 * Processes a CSV file, parsing its content and inserting records into the database in batches.
 *
 * This function uses a 'for await...of' loop to iterate over the stream. This is crucial for
 * handling backpressure correctly. The loop will pause and wait for the async database
 * operation (insertMany) to complete before requesting the next chunk of data from the
 * file stream. This prevents memory overload by ensuring the file reading speed matches
 * the database writing speed.
 *
 * @param {string} filePath The path to the temporary file to be processed.
 * @returns {Promise<void>} A promise that resolves when the processing is complete.
 */

const processCsvFile = async (filePath) => {
    const stream = fs.createReadStream(filePath).pipe(csv());
    let recordsBatch = [];

    try {
        for await (const record of stream) {
            recordsBatch.push(record);

            if (recordsBatch.length >= BATCH_SIZE) {
                await Records.insertMany(recordsBatch, { ordered: false });
                recordsBatch = [];
            }
        }

        // Insert any remaining records in the final batch.
        if (recordsBatch.length > 0) {
            await Records.insertMany(recordsBatch, { ordered: false });
        }
    } finally {
        // Ensure the temporary file is always deleted, even if an error occurs.
        await fs.promises.unlink(filePath);
    }
};

module.exports = {
    processCsvFile,
};
