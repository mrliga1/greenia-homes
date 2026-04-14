/* ==============================================================
   KẾT NỐI API VỚI GOOGLE SHEETS (DẠNG JSON)
============================================================== */

// DÁN CÁI LINK WEB APP CỦA BẠN VÀO ĐÂY (Giữ nguyên trong dấu nháy kép)
const API_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRbho8fMxuBsf0_BUSWNabTBWHuerYsn4WBdw857csTHrkXjM22zmQ8ssjvvo2BrP_t2CGhygjhRukQ/pub?output=csv";

// Hàm lấy dữ liệu đa năng (Bạn muốn lấy Tab nào thì truyền tên Tab đó vào)
async function fetchSheetData(tabName) {
    try {
        console.log(`Đang tải dữ liệu từ tab: ${tabName}...`);
        
        // Nối thêm ?tab=TenTab vào đuôi URL để báo cho Google Sheets biết
        const response = await fetch(`${API_URL}?tab=${tabName}`);
        
        if (!response.ok) throw new Error("Lỗi mạng khi tải dữ liệu");
        
        const data = await response.json();
        
        if (data.error) {
            console.error("Lỗi từ máy chủ:", data.error);
            return [];
        }
        
        console.log(`Tải thành công ${data.length} dự án từ ${tabName}`);
        return data;

    } catch (error) {
        console.error(`Lỗi kết nối đến tab ${tabName}:`, error);
        return []; // Trả về mảng rỗng nếu lỗi để web không bị sập
    }
}