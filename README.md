# TerraGuess

Trò chơi đoán vị trí qua ảnh đường phố: bạn được thả xuống một nơi bất kỳ trên thế giới, nhìn quanh, rồi đặt ghim lên bản đồ để đoán. Chơi miễn phí, **không giới hạn số ván**.

> Đây là dự án tự làm, không liên quan và không dùng mã nguồn, logo hay hình ảnh của GeoGuessr.

## Tính năng

- 5 vòng mỗi ván, tối đa 5.000 điểm mỗi vòng (điểm giảm dần theo khoảng cách).
- Bản đồ **Toàn thế giới**, chọn ngẫu nhiên trong các vùng có ảnh đường phố.
- Chế độ **Di chuyển**, **Không di chuyển**, **NMPZ** (không đi, không xoay, không zoom).
- Đồng hồ đếm ngược tuỳ chọn (10 giây – 5 phút). Hết giờ thì ghim đang đặt được tính luôn.
- Bản đồ đoán ở góc phải: to ra khi rê chuột, có nút phóng to / ghim.
- La bàn, nút quay về điểm xuất phát, màn kết quả từng vòng và tổng kết cả ván.
- Lưu thống kê (số ván, điểm cao nhất, điểm trung bình) trong trình duyệt.
- Phím tắt: **Space** để đoán / sang vòng tiếp theo.

## Nguồn ảnh đường phố

Bạn nhập key ngay trên trang chủ của game. Key chỉ lưu trong trình duyệt của bạn (localStorage), không gửi đi đâu khác ngoài Google/Mapillary.

| Nguồn | Cần gì | Ghi chú |
| --- | --- | --- |
| Google Street View | API key bật **Maps JavaScript API**, có gắn thanh toán | Giống trải nghiệm gốc nhất. Google có hạn mức miễn phí hằng tháng. Nên giới hạn key theo tên miền trang của bạn. |
| Mapillary | Client Token miễn phí tại mapillary.com/dashboard/developers | Ảnh cộng đồng, tập trung ở thành phố. |

Bản đồ để đoán dùng OpenStreetMap qua CARTO, không cần key.

## Chạy trên máy (Windows / macOS / Linux)

Cần Node.js 22.12+ (khuyên dùng 24).

```bash
npm install
npm run dev      # mở http://localhost:5173
npm test         # chạy unit test
npm run build    # bản build tĩnh trong thư mục dist/
```

Nguồn ảnh **Dùng thử (không cần key)** chỉ để xem giao diện và luồng chơi, ảnh đường phố được thay bằng nền vẽ.

## Đưa lên GitHub Pages

Bản build của game (`index.html`, `assets/`, `favicon.svg` ở gốc repo) được workflow
`.github/workflows/deploy.yml` tạo lại và commit sau mỗi lần push, nên **Settings → Pages**
chọn kiểu nào cũng chạy:

- *Deploy from a branch* → branch này, thư mục `/ (root)`.
- *GitHub Actions* → workflow tự đăng thư mục `dist/`.

Game sẽ có ở `https://<tên-tài-khoản>.github.io/<tên-repo>/`.
Mã nguồn nằm trong `src/`; đừng sửa tay `index.html` và `assets/` ở gốc, chúng được tạo tự động
(`npm run build:pages`).

## Cấu trúc

```
src/
  index.html   trang gốc của Vite
  game/        tính khoảng cách, điểm, danh sách vùng
  providers/   Google Street View, Mapillary, nguồn giả lập (chỉ khi dev)
  components/  giao diện: trang chủ, màn chơi, bản đồ, kết quả
```
