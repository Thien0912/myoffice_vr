export const SECTION_EVENTS: Record<string, string> = {
  THONGTINGIADINH: 'section-thongtingiadinh-changed',
  HOPDONG: 'section-hopdong-changed',
  QUATRINHCONGTAC: 'section-quatrinhcongtac-changed',
  DANHGIA: 'section-danhgia-changed',
  KINHNGHIEM: 'section-kinhnghiem-changed',
  CHUNGCHI: 'section-chungchi-changed',
  BANGCAP: 'section-bangcap-changed',
  QUATRINHDAOTAO: 'section-quatrinhdaotao-changed',
  KHENTHUONG: 'section-khenthuong-changed',
  THOIVIEC: 'section-thoiviec-changed',
} as const

export type SectionEventName = (typeof SECTION_EVENTS)[keyof typeof SECTION_EVENTS]

export function dispatchSectionChanged(event: SectionEventName) {
  window.dispatchEvent(new CustomEvent(event))
}
