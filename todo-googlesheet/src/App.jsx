import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, CheckCircle, Circle, Plus, Edit2, Save } from 'lucide-react';

// THAY THẾ ĐƯỜNG DẪN API CỦA BẠN Ở ĐÂY
const API_URL = "https://script.google.com/macros/s/AKfycbxF4A1e7uLNcYYS_6w7Fv9_B0cnKfEAexBDgb7AXczQTBdKK6YhKWygMij_567XSlyO/exec"; 

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // TỰ ĐỘNG LẤY DỮ LIỆU KHI VỪA MỞ APP
  useEffect(() => {
    fetchTodos();
  }, []);

  // 1. LẤY DỮ LIỆU (READ)
  const fetchTodos = async () => {
    setLoading(true);
    try {
      // Dùng fetch thuần của trình duyệt để xử lý tốt cơ chế redirect của Google
      const response = await fetch(API_URL, {
        method: 'GET',
        redirect: 'follow'
      });
      const data = await response.json();
      setTodos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    }
    setLoading(false);
  };

  // 2. THÊM CÔNG VIỆC
  const addTodo = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;

    const params = new URLSearchParams();
    params.append("action", "create");
    params.append("id", Date.now().toString());
    params.append("title", task);
    params.append("status", "Đang làm");
    params.append("date", new Date().toLocaleDateString('vi-VN'));

    try {
      await axios.post(API_URL, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      setTask('');
      fetchTodos();
    } catch (error) {
      console.error("Lỗi khi thêm:", error);
    }
  };

  // 3. XÓA CÔNG VIỆC
  const deleteTodo = async (id) => {
    const params = new URLSearchParams();
    params.append("action", "delete");
    params.append("id", id);

    try {
      await axios.post(API_URL, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      fetchTodos();
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    }
  };

  // 4. ĐỔI TRẠNG THÁI
  const toggleStatus = async (todo) => {
    const updatedStatus = todo.status === "Đang làm" ? "Hoàn thành" : "Đang làm";
    const params = new URLSearchParams();
    params.append("action", "update");
    params.append("id", todo.id);
    params.append("status", updatedStatus);

    try {
      await axios.post(API_URL, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      fetchTodos();
    } catch (error) {
      console.error("Lỗi trạng thái:", error);
    }
  };

  // KÍCH HOẠT CHẾ ĐỘ SỬA (Hàm bị thiếu ban đầu)
  const startEdit = (todo) => {
    setIsEditing(todo.id);
    setEditTitle(todo.title);
  };

  // 5. SỬA TÊN CÔNG VIỆC
  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;
    
    const params = new URLSearchParams();
    params.append("action", "update");
    params.append("id", id);
    params.append("title", editTitle);

    try {
      await axios.post(API_URL, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      setIsEditing(null);
      fetchTodos();
    } catch (error) {
      console.error("Lỗi sửa tên:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Ứng Dụng Quản Lý Công Việc 📝
        </h1>

        {/* Form Thêm Công Việc */}
        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập công việc cần làm..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-1"
          >
            <Plus size={18} /> Thêm
          </button>
        </form>

        {/* Danh sách hiển thị */}
        {loading ? (
          <p className="text-center text-gray-500">Đang tải...</p>
        ) : (
          <ul className="space-y-3">
            {todos.length === 0 ? (
              <p className="text-center text-gray-400 py-4">Chưa có công việc nào!</p>
            ) : (
              todos.map((todo) => (
                <li
                  key={todo.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition ${
                    todo.status === "Hoàn thành" ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 mr-2">
                    {/* Nút Đổi Trạng Thái */}
                    <button onClick={() => toggleStatus(todo)} className="text-gray-500 hover:text-blue-500">
                      {todo.status === "Hoàn thành" ? (
                        <CheckCircle className="text-green-500" size={22} />
                      ) : (
                        <Circle size={22} />
                      )}
                    </button>

                    {/* Nội dung text / Input Sửa */}
                    {isEditing === todo.id ? (
                      <input
                        type="text"
                        className="border-b border-blue-500 focus:outline-none flex-1 py-1"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    ) : (
                      <span className={`text-gray-700 font-medium ${todo.status === "Hoàn thành" ? 'line-through text-gray-400' : ''}`}>
                        {todo.title}
                      </span>
                    )}
                  </div>

                  {/* Cụm nút Thao tác */}
                  <div className="flex items-center gap-1">
                    {isEditing === todo.id ? (
                      <button onClick={() => saveEdit(todo.id)} className="p-2 text-green-600 hover:bg-green-50 rounded">
                        <Save size={18} />
                      </button>
                    ) : (
                      <button onClick={() => startEdit(todo)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded">
                        <Edit2 size={18} />
                      </button>
                    )}
                    <button onClick={() => deleteTodo(todo.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;