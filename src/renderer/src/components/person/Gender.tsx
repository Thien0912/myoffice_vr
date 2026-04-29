type GenderProps = {
  key?: string | number
}

export default function Gender({ key }: GenderProps) {
  switch (key) {
    case '1':
      return <div>Nam</div>
    case '2':
      return <div>Nữ</div>
    default:
      return <div>Khác</div>
  }
}
