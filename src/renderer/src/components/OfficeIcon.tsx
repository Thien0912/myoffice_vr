function WordIcon({
  size = 24,
  color = '#1A73E8'
}: {
  size?: number
  color?: string
}): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} rx="2" fill={color} />
      <text
        x="8"
        y="9.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="8"
        fontWeight="700"
        fill="#FFFFFF"
      >
        W
      </text>
    </svg>
  )
}

function PdfIcon({
  size = 24,
  color = '#D93027'
}: {
  size?: number
  color?: string
}): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} rx="2" fill={color} />
      <text
        x="8"
        y="11.5"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="7"
        fontWeight="700"
        fill="#FFFFFF"
      >
        PDF
      </text>
    </svg>
  )
}

function ExcelIcon({
  size = 24,
  color = '#1E8E3E'
}: {
  size?: number
  color?: string
}): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} rx="2" fill={color} />
      <text
        x="8"
        y="9.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="8"
        fontWeight="700"
        fill="#FFFFFF"
      >
        X
      </text>
    </svg>
  )
}

function PictureIcon({
  size = 24,
  color = '#D93025'
}: {
  size?: number
  color?: string
}): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} rx="2" fill={color} />
      <path d="M3 11L6.2 7.8L8.5 10.2L10.5 8.2L13 11H3Z" fill="#FFFFFF" />
      <circle cx="6" cy="5.5" r="1.2" fill="#FFFFFF" />
    </svg>
  )
}

function ZipIcon({
  size = 24,
  color = '#ebaa11'
}: {
  size?: number
  color?: string
}): React.JSX.Element {
  return (
    <svg
      fill="#ebaa11"
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={size}
      height={size}
      viewBox="0 0 31.519 31.519"
      xmlSpace="preserve"
    >
      <g>
        <path
          d="M11.183,0L3.021,8.619v22.9h25.477V0H11.183z M21.132,24.505c-0.06,0.096-0.201,0.315-0.834,0.321
            c-0.635-0.006-0.777-0.227-0.836-0.321c-0.535-0.866,0.027-3.132,0.791-5.104h0.088C21.105,21.373,21.666,23.639,21.132,24.505z
            M10.464,3.625v3.818H6.847L10.464,3.625z M26.527,29.55H4.99V9.413h7.443V1.971h4.598v1.595h2.178v1.681h-2.178v1.857h2.178v1.857
            h-2.178v1.857h2.178v1.761h-2.178v1.825H16.36v4.995h1.397c-0.715,2.07-1.276,4.707-0.28,6.327
            c0.397,0.646,1.208,1.411,2.794,1.429v0.004c0.009,0,0.018-0.002,0.025-0.002c0.009,0,0.017,0.002,0.025,0.002v-0.004
            c1.585-0.018,2.395-0.783,2.793-1.429c0.996-1.62,0.436-4.257-0.281-6.327h1.401v-4.995h-2.851v-1.825h2.179v-1.856h-2.177V8.961
            h2.179V7.104h-2.179V5.327h2.179V3.47h-2.179V1.971h5.142L26.527,29.55L26.527,29.55z"
        />
        <path
          d="M11.183,0L3.021,8.619v22.9h25.477V0H11.183z M21.132,24.505c-0.06,0.096-0.201,0.315-0.834,0.321
            c-0.635-0.006-0.777-0.227-0.836-0.321c-0.535-0.866,0.027-3.132,0.791-5.104h0.088C21.105,21.373,21.666,23.639,21.132,24.505z
            M10.464,3.625v3.818H6.847L10.464,3.625z M26.527,29.55H4.99V9.413h7.443V1.971h4.598v1.595h2.178v1.681h-2.178v1.857h2.178v1.857
            h-2.178v1.857h2.178v1.761h-2.178v1.825H16.36v4.995h1.397c-0.715,2.07-1.276,4.707-0.28,6.327
            c0.397,0.646,1.208,1.411,2.794,1.429v0.004c0.009,0,0.018-0.002,0.025-0.002c0.009,0,0.017,0.002,0.025,0.002v-0.004
            c1.585-0.018,2.395-0.783,2.793-1.429c0.996-1.62,0.436-4.257-0.281-6.327h1.401v-4.995h-2.851v-1.825h2.179v-1.856h-2.177V8.961
            h2.179V7.104h-2.179V5.327h2.179V3.47h-2.179V1.971h5.142L26.527,29.55L26.527,29.55z"
          fill={color}
        />
      </g>
    </svg>
  )
}

function FileNotFoundIcon({
  size = 26,
  color = '#666666'
}: {
  size?: number
  color?: string
}): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="#" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.493 0.015 C 7.442 0.021,7.268 0.039,7.107 0.055 C 5.234 0.242,3.347 1.208,2.071 2.634 C 0.660 4.211,-0.057 6.168,0.009 8.253 C 0.124 11.854,2.599 14.903,6.110 15.771 C 8.169 16.280,10.433 15.917,12.227 14.791 C 14.017 13.666,15.270 11.933,15.771 9.887 C 15.943 9.186,15.983 8.829,15.983 8.000 C 15.983 7.171,15.943 6.814,15.771 6.113 C 14.979 2.878,12.315 0.498,9.000 0.064 C 8.716 0.027,7.683 -0.006,7.493 0.015 M8.853 1.563 C 9.548 1.653,10.198 1.848,10.840 2.160 C 11.538 2.500,12.020 2.846,12.587 3.413 C 13.154 3.980,13.500 4.462,13.840 5.160 C 14.285 6.075,14.486 6.958,14.486 8.000 C 14.486 9.054,14.284 9.932,13.826 10.867 C 13.654 11.218,13.307 11.781,13.145 11.972 L 13.090 12.037 8.527 7.473 L 3.963 2.910 4.028 2.855 C 4.219 2.693,4.782 2.346,5.133 2.174 C 6.305 1.600,7.555 1.395,8.853 1.563 M7.480 8.534 L 12.040 13.095 11.973 13.148 C 11.734 13.338,11.207 13.662,10.867 13.828 C 10.239 14.135,9.591 14.336,8.880 14.444 C 8.456 14.509,7.544 14.509,7.120 14.444 C 5.172 14.148,3.528 13.085,2.493 11.451 C 2.279 11.114,1.999 10.526,1.859 10.119 C 1.468 8.989,1.403 7.738,1.670 6.535 C 1.849 5.734,2.268 4.820,2.766 4.147 C 2.836 4.052,2.899 3.974,2.907 3.974 C 2.914 3.974,4.972 6.026,7.480 8.534 "
        stroke="none"
        fill={color}
      ></path>
    </svg>
  )
}

interface OfficeIconProps {
  name: string
  size?: number
  color?: string
}

export default function OfficeIcon({ name, size = 24, color }: OfficeIconProps): React.JSX.Element {
  const safeName = typeof name === 'string' ? name : ''
  const ext = safeName.toLowerCase().split('.').pop() || ''
  switch (ext) {
    case 'doc':
    case 'docx':
      return <WordIcon size={size} color={color} />
    case 'pdf':
      return <PdfIcon size={size} color={color} />
    case 'xls':
    case 'xlsx':
      return <ExcelIcon size={size} color={color} />
    case 'jpg':
    case 'png':
    case 'jpeg':
    case 'gif':
      return <PictureIcon size={size} color={color} />
    case 'zip':
      return <ZipIcon size={size} />
    default:
      return <FileNotFoundIcon size={size} color={color} />
  }
}

export { WordIcon, PdfIcon, ExcelIcon, PictureIcon, ZipIcon }
