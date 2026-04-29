import { Separator } from '@heroui-v3/react'
import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage(): React.JSX.Element {
  return (
    <div className="container mx-auto h-screen flex justify-center items-center">
      <div className="flex h-15 items-center space-x-4 text-small">
        <h1 className="text-7xl text-shadow-md text-shadow-slate-300 text-center font-bold text-red-500">
          <span className="-ml-5">4</span>
          <span className="-ml-5">0</span>
          <span className="-ml-4">4</span>
        </h1>
        <Separator orientation="vertical" className="h-full" />
        <div>
          <p className="font-bold mb-0 text-gray-500">MyOffice DNC</p>
          <small className="">---Không tìm thấy trang này.</small>
          <br />
          <Link to="/" className="text-blue-500">
            <span className="underline">Quay về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
