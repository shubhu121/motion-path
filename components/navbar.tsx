"use client"
import { motion, type Variants } from "motion/react"
import Logo from "./logo/logo"
import { ModeToggle } from "./ui/mode-toggle"

const navbarVariants = {
    hidden: { opacity: 0, y: -30, filter: "blur(6px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.2, // faster: was 0.3
            ease: "easeOut",
            when: "beforeChildren",
            staggerChildren: 0.10 // speed up staggering too
        }
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: -15, filter: "blur(6px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.2, // faster: was 0.3
            ease: "easeOut"
        }
    }
}

export const Navbar = () => {
    return (
        <motion.nav
            variants={navbarVariants as Variants}
            initial="hidden"
            animate="visible"
            className="flex w-full items-center justify-between rounded-xl rounded-t-none border border-border bg-muted/50 px-4 py-3"
        >
            <motion.h1
                className="font-heading text-3xl font-light tracking-tight"
                variants={itemVariants as Variants}
            >
                <Logo className="mr-2 inline-block size-10" aria-hidden /> Motion Path
            </motion.h1>
            <motion.div variants={itemVariants as Variants}>
                <ModeToggle />
            </motion.div>
        </motion.nav>
    )
}