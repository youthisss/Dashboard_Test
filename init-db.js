const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./toko.db');

const products = [
    { nama: 'Laptop A', stok: 10 },
    { nama: 'Mouse B', stok: 50 },
    { nama: 'Keyboard C', stok: 30 },
    { nama: 'Monitor D', stok: 15 },
    { nama: 'Headset E', stok: 25 },
    { nama: 'Webcam F', stok: 20 },
    { nama: 'Mic G', stok: 18 },
    { nama: 'Printer H', stok: 12 },
    { nama: 'Speaker I', stok: 40 },
    { nama: 'Flashdisk J', stok: 100 },
];

db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS Produk`);
    db.run(`DROP TABLE IF EXISTS Pembelian`);

    db.run(`CREATE TABLE IF NOT EXISTS Produk (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        stok INTEGER NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Pembelian (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produk_id INTEGER,
        jumlah_beli INTEGER NOT NULL,
        tanggal DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL,
        FOREIGN KEY (produk_id) REFERENCES Produk(id)
    )`);

    const stmt = db.prepare("INSERT INTO Produk (nama, stok) VALUES (?, ?)");
    for (const p of products) {
        stmt.run(p.nama, p.stok);
    }
    stmt.finalize();
});

db.close();