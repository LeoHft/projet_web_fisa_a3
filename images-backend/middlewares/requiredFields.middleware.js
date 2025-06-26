module.exports = (fieldsRequired) => {
    return (req, res, next) => {
        const missingFields = [];

        fieldsRequired.forEach((field) => {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Des champs requis sont manquants',
                fields: missingFields
            });
        }
        next();
    };
};