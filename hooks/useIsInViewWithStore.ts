import { NavbarKeys } from "@/components/sections/Navbar"
import { useNavbarStore } from "@/stores/nav-providers"
import { useInView } from "framer-motion"
import { useRef, useEffect } from "react"

export function useIsInViewWithStore(target: NavbarKeys) {
    const ref = useRef(null)
    const isInView = useInView(ref)
    const { setSelectedNavbarItem } = useNavbarStore(state => state)

    useEffect(() => {
        if (!isInView) return
        setSelectedNavbarItem(target)
    }, [isInView])

    return { ref, isInView, setSelectedNavbarItem }
}