import { useState } from 'react'
import {
  Link
} from '@tanstack/react-router'

const Nav = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  
  return (
    <div className="p-2 flex gap-2 text-lg border-b">
      <Link
        to="/"
        activeProps={{
          className: 'font-bold',
        }}
        activeOptions={{ exact: true }}
        style={{marginRight: 10}}
      >
        Home
      </Link>{' '}
      <Link
        to="/nguoi-dung"
        activeProps={{
          className: 'font-bold',
        }}
        style={{marginRight: 10}}
      >
        Users
      </Link>{' '}
      <Link
        to="/dang-nhap"
        activeProps={{
          className: 'font-bold',
        }}
        style={{marginRight: 10}}
      >
        Login
      </Link>{' '}
      <div className="relative group">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'procedures' ? null : 'procedures')}
          className="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100"
          style={{marginRight: 10}}
        >
          Thủ Tục Hành Chính
          <span className="text-sm">▼</span>
        </button>
        {openDropdown === 'procedures' && (
          <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
            <Link
              to="/thu-tuc/tu-cong-bo"
              activeProps={{
                className: 'bg-gray-100 font-bold',
              }}
              className="block px-4 py-2 hover:bg-gray-100 text-gray-800"
              onClick={() => setOpenDropdown(null)}
            >
              Tự Công Bố
            </Link>
            <Link
              to="/thu-tuc/thu-tuc-hanh-chinh"
              activeProps={{
                className: 'bg-gray-100 font-bold',
              }}
              className="block px-4 py-2 hover:bg-gray-100 text-gray-800 border-t border-gray-200"
              onClick={() => setOpenDropdown(null)}
            >
              Danh Sách
            </Link>
          </div>
        )}
      </div>
      <Link
        to="/this-route-does-not-exist"
        activeProps={{
          className: 'font-bold',
        }}
        style={{marginRight: 10}}
      >
        Not Exist
      </Link>
    </div>
  )
}
export default Nav;