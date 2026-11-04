# Batam Ports WebGIS

Peta interaktif pelabuhan Batam (data: BP Batam, Tahun 2025) (Leaflet + OpenStreetMap / Google Maps / Google Satellite).

- `index.html` : halaman utama
- `css/style.css` : tampilan
- `js/data.js` : data pelabuhan, jalur kapal (JALUR_KAPAL.geojson), dan batas kecamatan
- `js/app.js` : logika peta, animasi kapal, dan grafik

## Menjalankan di GitHub Pages
1. Upload semua isi folder ini ke repository (index.html harus di root).
2. Settings > Pages > Source: Deploy from a branch > `main` / `(root)` > Save.
3. Buka `https://<username>.github.io/<nama-repo>/`.

Lokal: jalankan `python -m http.server` di folder ini lalu buka http://localhost:8000
