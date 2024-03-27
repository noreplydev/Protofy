import NextInternalLink from 'next/link'
import * as React from 'react'

export const NextLink = React.forwardRef(({native, ...props}:any, ref:any) => {
  return (
    native ? <a ref={ref} {...props} prefetch={props.prefetch?"true":"false"} className={`next-link ` + (props.className || '')}></a>:<NextInternalLink ref={ref} {...props} prefetch={props.prefetch} className={`next-link ` + (props.className || '')} />
  )
}) as typeof NextInternalLink
