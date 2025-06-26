import express from 'express';
const router = express.Router();

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

export default (db) => {
    // Check if country is visited
    router.get('/visited/:country_code', ensureAuthenticated, async (req, res) => {
        const { country_code } = req.params;
        const user_id = req.user.id;
        try {
            const result = await db.query("SELECT * FROM visited WHERE user_id = $1 AND country_code = $2", [user_id, country_code]);
            res.json({ isVisited: result.rows.length > 0 });
        } catch (err) {
            console.error('Error checking visited status:', err);
            res.status(500).json({ error: 'Database error' });
        }
    });

    // Check if country is in wishlist
    router.get('/wishlist/:country_code', ensureAuthenticated, async (req, res) => {
        const { country_code } = req.params;
        const user_id = req.user.id;
        try {
            const result = await db.query("SELECT * FROM wishlist WHERE user_id = $1 AND country_code = $2", [user_id, country_code]);
            res.json({ isInWishlist: result.rows.length > 0 });
        } catch (err) {
            console.error('Error checking wishlist status:', err);
            res.status(500).json({ error: 'Database error' });
        }
    });

    // Get user's visited countries
    router.get('/visited', ensureAuthenticated, async (req, res) => {
        const user_id = req.user.id;
        try {
            const result = await db.query("SELECT country_code FROM visited WHERE user_id = $1", [user_id]);
            res.json({ visitedCountries: result.rows.map(row => row.country_code) });
        } catch (err) {
            console.error('Error fetching visited countries:', err);
            res.status(500).json({ error: 'Database error' });
        }
    });

    // Get user's wishlist countries
    router.get('/wishlist', ensureAuthenticated, async (req, res) => {
        const user_id = req.user.id;
        try {
            const result = await db.query("SELECT country_code FROM wishlist WHERE user_id = $1", [user_id]);
            res.json({ wishlistCountries: result.rows.map(row => row.country_code) });
        } catch (err) {
            console.error('Error fetching wishlist countries:', err);
            res.status(500).json({ error: 'Database error' });
        }
    });

    router.post('/visited', ensureAuthenticated, async (req, res) => {
        const { country_code } = req.body;
        const user_id = req.user.id;
        try{
            await db.query("INSERT INTO visited (user_id, country_code) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [user_id,country_code]);
            res.json({success: true, message: 'Country marked as visited'});
        }catch(err){
            console.error('Error marking country as visited:', err);
            res.status(500).send('Error marking country as visited');
        }
    });

    // Remove from visited
    router.delete('/visited/:country_code', ensureAuthenticated, async (req, res) => {
        const { country_code } = req.params;
        const user_id = req.user.id;
        try {
            await db.query("DELETE FROM visited WHERE user_id = $1 AND country_code = $2", [user_id, country_code]);
            res.json({ success: true, message: 'Removed from visited' });
        } catch (err) {
            console.error('Error removing from visited:', err);
            res.status(500).json({ error: 'Database error' });
        }
    });

    // Add to wishlist
    router.post("/wishlist", ensureAuthenticated, async (req, res) => {
        const { country_code } = req.body;
        const user_id = req.user.id;
        try {
            await db.query(
                "INSERT INTO wishlist (user_id, country_code) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                [user_id, country_code]
            );
            res.json({ success: true, message: 'Added to wishlist' });
        } catch (err) {
            res.status(500).json({ error: "Database error" });
        }
    });

    // Remove from wishlist
    router.delete('/wishlist/:country_code', ensureAuthenticated, async (req, res) => {
        const { country_code } = req.params;
        const user_id = req.user.id;
        try {
            await db.query("DELETE FROM wishlist WHERE user_id = $1 AND country_code = $2", [user_id, country_code]);
            res.json({ success: true, message: 'Removed from wishlist' });
        } catch (err) {
            console.error('Error removing from wishlist:', err);
            res.status(500).json({ error: 'Database error' });
        }
    });

    // Add or update note
    router.post("/note", ensureAuthenticated, async (req, res) => {
        const { country_code, note } = req.body;
        const user_id = req.user.id;
        try {
            await db.query(
                "INSERT INTO notes (user_id, country_code, note) VALUES ($1, $2, $3) ON CONFLICT (user_id, country_code) DO UPDATE SET note = $3, created_at = CURRENT_TIMESTAMP",
                [user_id, country_code, note]
            );
            res.json({ success: true, message: 'Note saved' });
        } catch (err) {
            res.status(500).json({ error: "Database error" });
        }
    });

    return router;
};
