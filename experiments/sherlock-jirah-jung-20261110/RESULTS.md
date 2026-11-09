# Kết quả chạy Sherlock: `jirah jung`

**Thời điểm:** 2026-11-10 (giờ Việt Nam).  
**Công cụ:** [sherlock-project/sherlock](https://github.com/sherlock-project/sherlock), phiên bản **0.16.2**.  
**Mã nguồn upstream:** `c588d7c8b476df9f9c84912a05d1430fb8cdcdae`.  
**Cách chạy:** GitHub Actions, Ubuntu 26.04, Python 3.12, clone mã nguồn upstream + `pip install ./sherlock-upstream`.  
**Nhật ký thực thi:** https://github.com/huyng0699-arch/OnePad-School-AI/actions/runs/42668048790  
**Dữ liệu xuất ra (artifact, giữ 2 ngày):** https://github.com/huyng0699-arch/OnePad-School-AI/actions/runs/42668048790/artifacts/13696764329

Lệnh:
```bash
sherlock "jirah jung" "jirahjung" "jirah_jung" "jirah-jung" --timeout 12 --print-found --no-color --txt --folderoutput results
```

## Kết quả công cụ trả về (chưa xác minh)

| Username | Phát hiện | Nền tảng & URL do Sherlock báo |
|---|---:|---|
| `jirah jung` | 5 | [BoardGameGeek](https://boardgamegeek.com/user/jirah%20jung), [Discord](https://discord.com), [Giphy](https://giphy.com/jirah%20jung), [Trakt](https://www.trakt.tv/users/jirah%20jung), [omg.lol](https://jirah%20jung.omg.lol) |
| `jirahjung` | 3 | [RuneScape](https://apps.runescape.com/runemetrics/app/overview/player/jirahjung), [Trakt](https://www.trakt.tv/users/jirahjung), [Pinterest](https://www.pinterest.com/jirahjung/) |
| `jirah_jung` | 2 | [Trakt](https://www.trakt.tv/users/jirah_jung), [omg.lol](https://jirah_jung.omg.lol) |
| `jirah-jung` | 3 | [BoardGameGeek](https://boardgamegeek.com/user/jirah-jung), [Discord](https://discord.com), [Trakt](https://www.trakt.tv/users/jirah-jung) |
| **Tổng** | **13** | 13 lượt phát hiện từ Sherlock, **không phải** 13 tài khoản của cùng một người |

## Diễn giải độ tin cậy

- **Kết quả công cụ:** Sherlock thông báo 13 lượt phát hiện. Đây là output có thật từ một lần chạy đã hoàn thành thành công.
- **Chưa xác minh độc lập:** Các trang đích được thử mở trực tiếp nhưng không truy cập được từ công cụ xác minh web hiện tại. Không có bằng chứng độc lập rằng các hồ sơ này thực sự tồn tại và hoạt động.
- **Dương tính giả rõ ràng về định danh:** Hai dòng Discord chỉ có `https://discord.com`, không có địa chỉ hồ sơ theo username; vì thế **không** chứng minh có tài khoản Discord tương ứng.
- **Cần nghi ngờ:** Nhiều biến thể cùng được báo trên Trakt; các URL chứa dấu cách mã hóa (`%20`) có thể không phải tên người dùng hợp lệ.
- **Không suy luận danh tính:** Kể cả các hồ sơ cùng username tồn tại, chỉ từ username không thể kết luận chúng thuộc về người có tên hiển thị “Jirah Jung”.
- **Không tìm thấy không chứng minh không tồn tại:** Sherlock không bao phủ toàn bộ web hoặc các tài khoản riêng tư.

## Phương pháp tái lập

Trên Linux hoặc GitHub Actions:

```bash
git clone --depth 1 https://github.com/sherlock-project/sherlock.git
python -m pip install ./sherlock
sherlock "jirah jung" "jirahjung" "jirah_jung" "jirah-jung" --timeout 12 --print-found --no-color --txt --folderoutput results
```

*Đây chỉ là phép thử OSINT trên các URL công khai, không phải chứng cứ xác định danh tính.*
