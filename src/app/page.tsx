import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'


const page = () => {
  return (
    <div>
      <Button>
        <Link href={'/dashboard'}>Click me
        </Link>
      </Button>
    </div>
  )
}

export default page
