export default function openPopout(key: string, name = 'Document Preview') {
  const type = name.split('.').pop()?.toLowerCase()
  const finalUrl = `/v2/preview/${key}?title=${encodeURIComponent(name)}&type=${type}#zoom=100`

  const popup = window.open(
    finalUrl,
    '_blank',
    'width=800,height=800,top=0,left=0,noopener,noreferrer'
  )

  if (popup) {
    popup.document.title = name
    popup.focus()
  }
}

type PreviewType =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'gif'
  | 'zip'
  | 'other'

// helper tạo element với props cơ bản
function createEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Partial<HTMLElementTagNameMap[K]> & { className?: string }
) {
  const el = document.createElement(tag)
  if (props) {
    Object.assign(el, props)
    if (props.className) el.className = props.className
  }
  return el
}

export function previewFile(url: string, name: string) {
  const type: PreviewType = (name.split('.').pop() || 'other').toLowerCase() as PreviewType

  // remove nếu đã tồn tại
  const existing = document.getElementById('gmail-style-preview')
  if (existing) existing.remove()

  // overlay container
  const container = createEl('div', { id: 'gmail-style-preview', className: 'preview-overlay' })
  Object.assign(container.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: '9999',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  })

  // card
  const card = createEl('div', { className: 'preview-card' })
  Object.assign(card.style, {
    width: '80%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
  })

  // header
  const header = createEl('div', { className: 'preview-header' })
  Object.assign(header.style, {
    flex: '0 0 50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #ddd'
  })
  header.innerHTML = `<span>${name}</span>`
  const closeBtn = createEl('button', { innerText: 'X' })
  closeBtn.addEventListener('click', () => container.remove())
  header.appendChild(closeBtn)

  // content
  const content = createEl('div', { className: 'preview-content' })
  Object.assign(content.style, {
    flex: '1',
    overflow: 'auto'
  })

  let innerEl: HTMLElement
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(type)) {
    const src = ['doc', 'docx', 'xls', 'xlsx'].includes(type)
      ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`
      : url
    const iframe = createEl('iframe', { src })
    Object.assign(iframe.style, { width: '100%', height: '100%', border: '0' })
    innerEl = iframe
  } else if (['png', 'jpg', 'jpeg', 'gif'].includes(type)) {
    const img = createEl('img', { src: url })
    Object.assign(img.style, {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      display: 'block',
      margin: '0 auto'
    })
    innerEl = img
  } else {
    const div = createEl('div', { innerText: 'Không hỗ trợ loại file này' })
    Object.assign(div.style, {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%'
    })
    innerEl = div
  }

  content.appendChild(innerEl)
  card.appendChild(header)
  card.appendChild(content)
  container.appendChild(card)
  document.body.appendChild(container)
}
