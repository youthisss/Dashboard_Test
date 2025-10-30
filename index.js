const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = new sqlite3.Database('./toko.db', (err) => {
    if (err) {
        console.error("Error saat koneksi ke DB:", err.message);
    }
    console.log('Terhubung ke database SQLite.');
});

app.get('/', async (req, res) => {
    try {
        const produk = await dbRunAll("SELECT * FROM Produk ORDER BY nama");
        const pembelian = await dbRunAll(`
            SELECT p.nama, b.id, b.jumlah_beli, b.status, b.tanggal 
            FROM Pembelian b
            JOIN Produk p ON b.produk_id = p.id
            ORDER BY b.tanggal DESC
        `);
        
        res.render('admin', { produk: produk, pembelian: pembelian, error: null });
    } catch (err) {
        res.render('admin', { produk: [], pembelian: [], error: err.message });
    }
});

app.post('/pembelian/baru', async (req, res) => {
    const { produk_id, jumlah } = req.body;
    
    try {
        await dbTransaction(async () => {
            const produk = await dbRunGet("SELECT stok FROM Produk WHERE id = ?", [produk_id]);
            
            if (!produk || produk.stok < jumlah) {
                throw new Error('Stok tidak mencukupi!');
            }
            
            await dbRun("UPDATE Produk SET stok = stok - ? WHERE id = ?", [jumlah, produk_id]);
            await dbRun(
                "INSERT INTO Pembelian (produk_id, jumlah_beli, status) VALUES (?, ?, 'COMPLETED')",
                [produk_id, jumlah]
            );
        });
        res.redirect('/');
    } catch (err) {
        const produk = await dbRunAll("SELECT * FROM Produk ORDER BY nama");
        const pembelian = await dbRunAll(`
            SELECT p.nama, b.id, b.jumlah_beli, b.status, b.tanggal 
            FROM Pembelian b JOIN Produk p ON b.produk_id = p.id
            ORDER BY b.tanggal DESC
        `);
        res.render('admin', { produk, pembelian, error: err.message });
    }
});

app.post('/pembelian/cancel/:id', async (req, res) => {
    const pembelian_id = req.params.id;

    try {
        await dbTransaction(async () => {
            const beli = await dbRunGet("SELECT * FROM Pembelian WHERE id = ?", [pembelian_id]);
            
            if (!beli) throw new Error('Data pembelian tidak ditemukan.');
            if (beli.status === 'CANCELLED') throw new Error('Pembelian sudah dibatalkan.');

            await dbRun("UPDATE Produk SET stok = stok + ? WHERE id = ?", [beli.jumlah_beli, beli.produk_id]);
            await dbRun("UPDATE Pembelian SET status = 'CANCELLED' WHERE id = ?", [pembelian_id]);
        });
        res.redirect('/');
    } catch (err) {
        console.error(err.message);
        res.redirect('/');
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});

function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
}

function dbRunAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function dbRunGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function dbTransaction(callback) {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            try {
                await dbRun("BEGIN TRANSACTION");
                await callback();
                await dbRun("COMMIT");
                resolve();
            } catch (err) {
                await dbRun("ROLLBACK");
                reject(err);
            }
        });
    });
}