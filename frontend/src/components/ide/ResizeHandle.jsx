/**
 * ResizeHandle — reusable drag handle for panel resizing.
 * Props:
 *   direction: 'horizontal' | 'vertical'
 *   onMouseDown: function
 */
export default function ResizeHandle({ direction = 'horizontal', onMouseDown }) {
  const isHoriz = direction === 'horizontal'

  return (
    <div
      className={`ide-resize-handle ide-resize-handle--${isHoriz ? 'col' : 'row'}`}
      onMouseDown={onMouseDown}
    >
      <div className="ide-resize-handle__inner" />
    </div>
  )
}
