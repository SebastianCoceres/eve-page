import { NavbarKeys } from "@/components/sections/Navbar"
import { useNavbarStore } from "@/stores/nav/nav-providers"
import { useRef, useEffect, useState } from "react"

export function useIsInViewWithStore(target: NavbarKeys) {
    const ref = useRef<HTMLDivElement>(null)
    const [isInView, setIsInView] = useState(false)
    const { setSelectedNavbarItem } = useNavbarStore(state => state)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting)
            if (entry.isIntersecting) {
                setSelectedNavbarItem(target)
            }
        })

        observer.observe(element)

        return () => observer.disconnect()
    }, [target, setSelectedNavbarItem])

    return { ref, isInView, setSelectedNavbarItem }
}
