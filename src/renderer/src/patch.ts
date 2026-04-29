// Cấu hình ghi đè ngôn ngữ trình duyệt thành en-GB để đảm bảo định dạng dd/mm/yyyy
// Phải chạy ĐẦU TIÊN trước khi các component bên trong thư viện UI được load.
try {
    Object.defineProperty(Navigator.prototype, 'language', {
        get: () => 'en-GB',
        configurable: true,
    })
    Object.defineProperty(Navigator.prototype, 'languages', {
        get: () => ['en-GB'],
        configurable: true,
    })
} catch {
    try {
        Object.defineProperty(navigator, 'language', { get: () => 'en-GB', configurable: true })
    } catch {
        ; (navigator as any).language = 'en-GB'
    }
}
