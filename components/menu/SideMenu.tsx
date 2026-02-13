// components/menu/SideMenu.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/cn"
import { Search } from "lucide-react"
import type { SideMenuNode } from "./types"
import { rootMenu } from "./rootmenu"
import { GuidedFocus } from "@/components/tutorial/GuidedFocus"

export function SideMenu() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [stack, setStack] = useState<{ title?: string; nodes: SideMenuNode[] }[]>([
    { title: "トップメニュー", nodes: rootMenu },
  ])
  const [activeTab, setActiveTab] = useState<"all" | "history">("all")
  const [query, setQuery] = useState("")
  const menuGuide = searchParams.get("menuGuide")
  const guideStage =
    menuGuide === "restricted-asset-register-menu"
      ? "restricted-asset-register-menu"
      : menuGuide === "restricted-assets-sub"
      ? "restricted-assets-sub"
      : menuGuide === "master-root" || menuGuide === "basic-setting"
      ? "master-root"
      : null
  const masterMaintenanceNode = useMemo(
    () => rootMenu.find((node) => node.id === "7"),
    []
  )
  const restrictedAssetsMaintenanceNode = useMemo(
    () => masterMaintenanceNode?.children?.find((node) => node.id === "7-6"),
    [masterMaintenanceNode]
  )

  const current = stack[stack.length - 1]
  const canGoBack = stack.length > 1
  const showMasterRootGuide = guideStage === "master-root" && stack.length === 1
  const showRestrictedAssetsGuide =
    guideStage === "restricted-assets-sub" &&
    stack.length > 1 &&
    current.title === masterMaintenanceNode?.label
  const showRegisterMenuGuide =
    guideStage === "restricted-asset-register-menu" &&
    stack.length > 2 &&
    current.title === restrictedAssetsMaintenanceNode?.label
  const showMenuGuide =
    showMasterRootGuide || showRestrictedAssetsGuide || showRegisterMenuGuide

  const handleGoTop = () => setStack([{ title: "トップメニュー", nodes: rootMenu }])
  const handleBack = () => {
    if (canGoBack) setStack((prev) => prev.slice(0, prev.length - 1))
  }

  const updateMenuGuide = (
    nextGuide:
      | "master-root"
      | "restricted-assets-sub"
      | "restricted-asset-register-menu"
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("menuGuide", nextGuide)
    router.replace(`${pathname}?${params.toString()}`)
  }

  const handleClickNode = (node: SideMenuNode) => {
    if (
      guideStage === "master-root" &&
      node.id === "7" &&
      node.children?.length
    ) {
      setStack((prev) => [...prev, { title: node.label, nodes: node.children! }])
      updateMenuGuide("restricted-assets-sub")
      return
    }

    if (
      guideStage === "restricted-assets-sub" &&
      node.id === "7-6" &&
      node.children?.length
    ) {
      setStack((prev) => [...prev, { title: node.label, nodes: node.children! }])
      updateMenuGuide("restricted-asset-register-menu")
      return
    }

    if (node.children?.length) {
      setStack((prev) => [...prev, { title: node.label, nodes: node.children! }])
    } else if (node.href) {
      if (guideStage === "restricted-asset-register-menu" && node.id === "7-6-1") {
        router.push("/restricted-asset-register?menuGuide=restricted-asset-type")
        return
      }
      router.push(node.href)
    }
  }

  const normalizePath = (path?: string) => {
    if (!path) return ""
    return path.startsWith("/") ? path : `/${path}`
  }

  const activeHref = useMemo(() => normalizePath(pathname), [pathname])

  const findPathByHref = (
    nodes: SideMenuNode[],
    targetHref: string,
    parents: SideMenuNode[] = [],
  ): SideMenuNode[] | null => {
    for (const node of nodes) {
      const nodeHref = normalizePath(node.href)
      if (nodeHref && nodeHref === targetHref) return [...parents, node]
      if (node.children?.length) {
        const found = findPathByHref(node.children, targetHref, [...parents, node])
        if (found) return found
      }
    }
    return null
  }

  useEffect(() => {
    if (guideStage) return
    if (!activeHref) return
    const path = findPathByHref(rootMenu, activeHref)
    if (!path) return

    const nextStack: { title?: string; nodes: SideMenuNode[] }[] = [
      { title: "トップメニュー", nodes: rootMenu },
    ]
    for (const node of path) {
      if (node.children?.length) {
        nextStack.push({ title: node.label, nodes: node.children })
      }
    }
    setStack(nextStack)
  }, [activeHref, guideStage])

  useEffect(() => {
    if (guideStage === "master-root") {
      setStack([{ title: "トップメニュー", nodes: rootMenu }])
      return
    }
    if (guideStage === "restricted-assets-sub" && masterMaintenanceNode?.children) {
      setStack([
        { title: "トップメニュー", nodes: rootMenu },
        { title: masterMaintenanceNode.label, nodes: masterMaintenanceNode.children },
      ])
      return
    }
    if (
      guideStage === "restricted-asset-register-menu" &&
      masterMaintenanceNode?.children &&
      restrictedAssetsMaintenanceNode?.children
    ) {
      setStack([
        { title: "トップメニュー", nodes: rootMenu },
        { title: masterMaintenanceNode.label, nodes: masterMaintenanceNode.children },
        {
          title: restrictedAssetsMaintenanceNode.label,
          nodes: restrictedAssetsMaintenanceNode.children,
        },
      ])
    }
  }, [guideStage, masterMaintenanceNode, restrictedAssetsMaintenanceNode])

  return (
    <aside
      className={cn(
        "w-64 min-h-screen bg-[#e8eef7] border-r border-[#c0c0c0] flex flex-col text-[13px] leading-tight",
        showMenuGuide && "relative z-[4000]"
      )}
    >
      {/* === 検索・タブ行 === */}
      <div className="p-3 bg-white border-b border-[#c0c0c0]">
        {/* 検索行 */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 flex items-center bg-white border border-[#c0c0c0] rounded px-2 h-7 text-sm">
            <Search className="w-4 h-4 text-[#666]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="ml-2 flex-1 bg-transparent outline-none text-[#333]"
              placeholder="検索"
            />
          </div>
        </div>

        {/* タブ行 */}
        <div className="flex gap-2 border-b border-[#c0c0c0]">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1 text-sm",
              activeTab === "all"
                ? "border-b-2 border-[#4a7ebb] text-[#4a7ebb] font-medium"
                : "text-[#666]"
            )}
          >
            全て
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-3 py-1 text-sm",
              activeTab === "history"
                ? "border-b-2 border-[#4a7ebb] text-[#4a7ebb] font-medium"
                : "text-[#666]"
            )}
          >
            履歴
          </button>
        </div>
      </div>

      {/* === 戻る／トップ行 === */}
      <div className="p-2 border-b border-[#c0c0c0] bg-[#e8eef7]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleGoTop}
            className="flex-1 bg-white border border-[#c0c0c0] rounded px-3 py-2 text-left text-sm hover:bg-[#f0f0f0] flex items-center gap-2"
          >
            <span className="w-5 h-5 bg-[#4a7ebb] rounded-sm flex items-center justify-center text-white text-xs font-bold">
              ⌂
            </span>
            <span>トップメニューへ</span>
          </button>
          {canGoBack && (
            <button
              onClick={handleBack}
              className="bg-white border border-[#c0c0c0] rounded px-3 py-2 text-sm hover:bg-[#f0f0f0] flex items-center gap-1"
            >
              <span className="text-[#4a7ebb]">✕</span>
              <span>戻る</span>
            </button>
          )}
        </div>
      </div>

      {/* === メニューカード群 === */}
      {/* flex-1 + overflow-y-auto で、中身だけスクロール */}
      <div
        className={cn(
          "flex-1 p-2 bg-[#e8eef7]",
          showMenuGuide ? "overflow-visible" : "overflow-y-auto"
        )}
      >
        {current.nodes.map((node) => {
          const button = (
            <button
              key={node.displayName ?? node.id}
              onClick={() => handleClickNode(node)}
              className={cn(
                "w-full border border-[#c0c0c0] rounded px-3 py-2 mb-2 text-left text-sm hover:bg-[#f0f0f0] flex items-center justify-between",
                "transition-colors duration-100",
                node.href ? "cursor-pointer" : "cursor-default",
                normalizePath(node.href) === activeHref &&
                  "bg-[#dbeafe] border-[#4a7ebb] shadow-[inset_0_0_0_1px_#4a7ebb]"
              )}
            >
  <div className="flex items-center gap-2 min-w-0">
    <span className="font-medium text-[#4a7ebb] whitespace-nowrap">{node.displayName ?? node.id}</span>
    <span className="text-[#333] truncate whitespace-nowrap overflow-hidden text-ellipsis block">
      {node.label}
    </span>
  </div>

              {/* アイコン */}
              {node.icon === "folder" && (
                <div className="w-5 h-5 bg-gradient-to-b from-[#f9d976] to-[#e6b800] rounded-sm flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="#8b6914"
                    className="w-3 h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7h5l2 2h11v8a2 2 0 01-2 2H3V7z"
                    />
                  </svg>
                </div>
              )}

              {node.icon === "gear" && (
                <div className="w-5 h-5 bg-gradient-to-b from-[#ff9966] to-[#ff6633] rounded-sm flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="#fff"
                    className="w-3 h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4z"
                    />
                  </svg>
                </div>
              )}

              {node.icon === "document" && (
                <div className="w-5 h-5 bg-gradient-to-b from-[#b0b0b0] to-[#808080] rounded-sm flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="#fff"
                    className="w-3 h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
                    />
                  </svg>
                </div>
              )}
            </button>
          )

          if (showMasterRootGuide && node.id === "7") {
            return (
              <GuidedFocus
                key={node.id}
                active
                message="使途拘束資産を管理するための保守メニューを追加しました"
                placement="right"
              >
                {button}
              </GuidedFocus>
            )
          }

          if (showRestrictedAssetsGuide && node.id === "7-6") {
            return (
              <GuidedFocus
                key={node.id}
                active
                message="ここから、使途拘束資産の設定を行います"
                placement="right"
              >
                {button}
              </GuidedFocus>
            )
          }

          if (showRegisterMenuGuide && node.id === "7-6-1") {
            return (
              <GuidedFocus
                key={node.id}
                active
                message=""
                placement="right"
              >
                {button}
              </GuidedFocus>
            )
          }

          return button
        })}
      </div>
    </aside>
  )
}
