'use client'
import { motion } from "framer-motion"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/Accordion"

export const MotionAccordion = motion(Accordion)
export const MotionAccordionItem = motion(AccordionItem)
export const MotionAccordionTrigger = motion(AccordionTrigger)
export const MotionAccordionContent = motion(AccordionContent)