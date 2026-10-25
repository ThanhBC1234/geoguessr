import { useState } from "react";
import { formatScore } from "../game/geo";
import type { Mode, ProviderId, Settings, Stats } from "../game/types";
import { providerIsReady } from "../providers";
import { googleKeyNeedsReload } from "../providers/google";
import { Logo } from "./Logo";

interface Props {
  settings: Settings;
  stats: Stats;
  onChange(s: Settings): void;
  onPlay(): void;
}

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "move", label: "Di chuyển", hint: "Đi lại tự do trên đường" },
  { id: "nomove", label: "Không di chuyển", hint: "Chỉ xoay và phóng to" },
  { id: "nmpz", label: "NMPZ", hint: "Không đi, không xoay, không zoom" },
];

const TIMES = [
  { value: 0, label: "Không giới hạn" },
  { value: 10, label: "10 giây" },
  { value: 30, label: "30 giây" },
  { value: 60, label: "1 phút" },
  { value: 120, label: "2 phút" },
  { value: 180, label: "3 phút" },
  { value: 300, label: "5 phút" },
];

const PROVIDERS: { id: ProviderId; label: string }[] = [
  { id: "google", label: "Google Street View" },
  { id: "mapillary", label: "Mapillary" },
  { id: "mock", label: "Dùng thử (không cần key)" },
];

export function Home({ settings, stats, onChange, onPlay }: Props) {
  const [showKey, setShowKey] = useState(false);
  const ready = providerIsReady(settings);
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => onChange({ ...settings, [key]: value });
  const needsReload = settings.provider === "google" && googleKeyNeedsReload(settings.googleKey.trim());

  return (
    <div className="home">
      <div className="home__bg" aria-hidden="true" />
      <main className="home__main">
        <Logo />
        <p className="home__tagline">Bạn được thả xuống một nơi bất kỳ trên thế giới. Nhìn quanh, rồi đoán xem mình đang ở đâu.</p>

        <button
          type="button"
          className="btn btn--primary btn--xl"
          disabled={!ready || needsReload}
          onClick={onPlay}
        >
          Chơi
        </button>
        {!ready && (
          <p className="home__warn">
            Nhập API key bên dưới, hoặc chọn <b>Dùng thử</b> để xem game chạy mà chưa cần key.
          </p>
        )}
        {needsReload && (
          <p className="home__warn">
            Bạn vừa đổi Google API key. <button type="button" className="link" onClick={() => window.location.reload()}>Tải lại trang</button> để dùng key mới.
          </p>
        )}

        <section className="card">
          <h2>Cài đặt ván chơi</h2>
          <div className="field">
            <span className="field__label">Bản đồ</span>
            <div className="chip is-active">Toàn thế giới</div>
          </div>
          <div className="field">
            <span className="field__label">Chế độ</span>
            <div className="segmented" role="radiogroup" aria-label="Chế độ">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={settings.mode === m.id}
                  className={settings.mode === m.id ? "is-active" : ""}
                  title={m.hint}
                  onClick={() => set("mode", m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <span className="field__hint">{MODES.find((m) => m.id === settings.mode)?.hint}</span>
          </div>
          <label className="field">
            <span className="field__label">Thời gian mỗi vòng</span>
            <select value={settings.timeLimit} onChange={(e) => set("timeLimit", Number(e.target.value))}>
              {TIMES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="card">
          <h2>Nguồn ảnh đường phố</h2>
          <div className="segmented" role="radiogroup" aria-label="Nguồn ảnh">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={settings.provider === p.id}
                className={settings.provider === p.id ? "is-active" : ""}
                onClick={() => set("provider", p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {settings.provider === "google" && (
            <>
              <label className="field">
                <span className="field__label">Google Maps API key</span>
                <div className="input-row">
                  <input
                    type={showKey ? "text" : "password"}
                    value={settings.googleKey}
                    placeholder="AIza…"
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(e) => set("googleKey", e.target.value)}
                  />
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowKey((v) => !v)}>
                    {showKey ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </label>
              <details className="help">
                <summary>Cách lấy key (khoảng 5 phút)</summary>
                <ol>
                  <li>
                    Vào{" "}
                    <a href="https://console.cloud.google.com/google/maps-apis/start" target="_blank" rel="noreferrer">
                      Google Cloud Console
                    </a>
                    , tạo project và gắn tài khoản thanh toán (Google có hạn mức miễn phí hằng tháng).
                  </li>
                  <li>Bật <b>Maps JavaScript API</b>.</li>
                  <li>Vào <b>Keys &amp; Credentials</b> → tạo API key.</li>
                  <li>
                    Nên giới hạn key: <b>Website restrictions</b> → thêm tên miền của trang này, và chỉ cho phép Maps
                    JavaScript API.
                  </li>
                  <li>Dán key vào ô trên. Key chỉ được lưu trong trình duyệt của bạn.</li>
                </ol>
              </details>
            </>
          )}

          {settings.provider === "mock" && (
            <p className="field__hint" style={{ marginTop: 12 }}>
              Chế độ này chỉ để xem giao diện và luồng chơi: ảnh đường phố được thay bằng nền vẽ, vị trí lấy từ danh
              sách cố định. Để chơi thật, chọn Google Street View hoặc Mapillary và nhập key.
            </p>
          )}

          {settings.provider === "mapillary" && (
            <>
              <label className="field">
                <span className="field__label">Mapillary Client Token</span>
                <div className="input-row">
                  <input
                    type={showKey ? "text" : "password"}
                    value={settings.mapillaryToken}
                    placeholder="MLY|…"
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(e) => set("mapillaryToken", e.target.value)}
                  />
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowKey((v) => !v)}>
                    {showKey ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </label>
              <details className="help">
                <summary>Cách lấy token (miễn phí)</summary>
                <ol>
                  <li>
                    Đăng nhập{" "}
                    <a href="https://www.mapillary.com/dashboard/developers" target="_blank" rel="noreferrer">
                      Mapillary Developers
                    </a>{" "}
                    và bấm <b>Register application</b>.
                  </li>
                  <li>Chọn quyền <b>Read</b>, lưu lại.</li>
                  <li>Sao chép <b>Client Token</b> (bắt đầu bằng MLY|) và dán vào ô trên.</li>
                </ol>
                <p>Ảnh Mapillary do cộng đồng chụp, tập trung ở thành phố, nên độ phủ không đều bằng Google.</p>
              </details>
            </>
          )}
        </section>

        {stats.gamesPlayed > 0 && (
          <section className="stats">
            <div>
              <b>{stats.gamesPlayed}</b>
              <span>ván đã chơi</span>
            </div>
            <div>
              <b>{formatScore(stats.bestScore)}</b>
              <span>điểm cao nhất</span>
            </div>
            <div>
              <b>{formatScore(Math.round(stats.totalScore / stats.gamesPlayed))}</b>
              <span>điểm trung bình</span>
            </div>
          </section>
        )}

        <footer className="home__footer">
          Trò chơi tự làm, không liên quan đến GeoGuessr. Bản đồ © OpenStreetMap, CARTO. Phím tắt: Space để đoán / sang vòng.
        </footer>
      </main>
    </div>
  );
}
