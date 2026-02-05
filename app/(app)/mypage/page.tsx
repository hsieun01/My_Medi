"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  User, 
  LogOut, 
  Bookmark, 
  Pill, 
  BarChart3, 
  ChevronRight,
  Star,
  Edit,
  Trash2,
  Plus,
  Bot,
  AlertTriangle,
  Send,
  Loader2
} from "lucide-react"
import { AppHeader } from "@/components/common/app-header"
import { AddMedicationModal } from "@/components/posts/add-medication-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMedication, type Medication, type SavedItem } from "@/lib/medication-context"
import { cn } from "@/lib/utils"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export default function MyPage() {
  const { savedItems, medications, removeSavedItem, deleteMedication } = useMedication()
  const [showAllSaved, setShowAllSaved] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{type: "medication" | "saved", id: string} | null>(null)
  const [selectedSavedItem, setSelectedSavedItem] = useState<SavedItem | null>(null)
  const [showSavedItemModal, setShowSavedItemModal] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)

  const displayedSavedItems = showAllSaved ? savedItems : savedItems.slice(0, 3)

  const handleOpenSavedItem = (item: SavedItem) => {
    setSelectedSavedItem(item)
    setChatMessages([])
    setChatInput("")
    setShowSavedItemModal(true)
  }

  const handleSendChat = async () => {
    if (!chatInput.trim() || !selectedSavedItem || isAiLoading) return

    const userMessage = chatInput.trim()
    setChatInput("")
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsAiLoading(true)

    setTimeout(() => {
      const responses: Record<string, string> = {
        "부작용": `${selectedSavedItem.titleKo || selectedSavedItem.title}의 일반적인 부작용으로는 가벼운 두통, 소화불량 등이 있을 수 있어요. 심각한 부작용이 느껴지면 즉시 의사와 상담하세요.`,
        "복용": `${selectedSavedItem.titleKo || selectedSavedItem.title} 관련 약은 보통 의사의 처방에 따라 복용합니다. 정해진 시간에 규칙적으로 복용하는 것이 중요해요.`,
        "음식": `${selectedSavedItem.titleKo || selectedSavedItem.title} 관련 약을 복용할 때는 자몽주스를 피하는 것이 좋고, 술은 약효에 영향을 줄 수 있으니 주의하세요.`,
        "default": `${selectedSavedItem.titleKo || selectedSavedItem.title}에 대해 더 궁금하신 점이 있으시군요! 구체적인 의료 상담은 담당 의사나 약사와 상담하시는 것이 가장 정확합니다.`
      }
      
      const key = Object.keys(responses).find(k => userMessage.includes(k)) || "default"
      setChatMessages(prev => [...prev, { role: "assistant", content: responses[key] }])
      setIsAiLoading(false)
    }, 1000)
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      if (deleteTarget.type === "medication") {
        deleteMedication(deleteTarget.id)
      } else {
        removeSavedItem(deleteTarget.id)
      }
      setDeleteTarget(null)
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader title="마이페이지" showProfile={false} />

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* User Info Section */}
        <section className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">사용자</h2>
              <p className="text-sm text-muted-foreground">user@email.com</p>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </section>

        {/* Two-column grid for desktop */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Saved Items Section */}
          <section className="bg-card rounded-xl p-4 lg:p-6 shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Bookmark className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">
                저장한 정보 ({savedItems.length}개)
              </h3>
            </div>

            {savedItems.length === 0 ? (
              <EmptySavedState />
            ) : (
              <>
                <div className="space-y-2">
                  {displayedSavedItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => handleOpenSavedItem(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleOpenSavedItem(item)
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {item.titleKo || item.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.type === "disease" ? "질환" : "약"}
                            {item.aiExplanation && (
                              <span className="ml-2 inline-flex items-center gap-1">
                                <Bot className="h-3 w-3" />
                                AI 설명 포함
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget({ type: "saved", id: item.id })
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {savedItems.length > 3 && (
                  <Button
                    variant="ghost"
                    className="w-full mt-3 text-primary"
                    onClick={() => setShowAllSaved(!showAllSaved)}
                  >
                    {showAllSaved ? "접기" : "더보기"}
                  </Button>
                )}
              </>
            )}
          </section>

          {/* Medications Management Section */}
          <section className="bg-card rounded-xl p-4 lg:p-6 shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">복용 중인 약 관리</h3>
            </div>

            {medications.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">
                  등록된 약이 없습니다
                </p>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary text-primary-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  약 추가하기
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {medications.map(med => (
                    <div
                      key={med.id}
                      className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {med.name}
                          {med.dosage && (
                            <span className="font-normal text-muted-foreground ml-1">
                              {med.dosage}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          1일 {med.frequency === "once" ? "1회" : med.frequency === "twice" ? "2회" : "3회"}
                          {med.times.morning && `, 아침 ${med.times.morning}`}
                          {med.times.lunch && `, 점심 ${med.times.lunch}`}
                          {med.times.evening && `, 저녁 ${med.times.evening}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingMedication(med)
                            setShowAddModal(true)
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget({ type: "medication", id: med.id })}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-3 bg-transparent"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  새 약 추가하기
                </Button>
              </>
            )}
          </section>
        </div>

        {/* History Section */}
        <section className="bg-card rounded-xl p-4 lg:p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">복약 이력 보기</h3>
          </div>

          <div className="flex gap-3">
            <Link href="/mypage/history?view=calendar" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                캘린더 뷰
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/mypage/history?view=chart" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                차트 뷰
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Add/Edit Medication Modal */}
      <AddMedicationModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open)
          if (!open) setEditingMedication(null)
        }}
        editingMedication={editingMedication}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "medication"
                ? "이 약을 삭제하면 관련된 복약 기록도 함께 삭제됩니다."
                : "저장한 정보가 삭제됩니다."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Saved Item Detail Modal */}
      <Dialog open={showSavedItemModal} onOpenChange={setShowSavedItemModal}>
        <DialogContent className="max-w-md lg:max-w-lg mx-auto max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              {selectedSavedItem?.titleKo || selectedSavedItem?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedSavedItem && (
            <div className="flex-1 overflow-y-auto space-y-4">
              <div>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-secondary text-muted-foreground mb-2">
                  {selectedSavedItem.type === "disease" ? "질환" : "약"}
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {selectedSavedItem.description}
                </p>
              </div>

              {selectedSavedItem.aiExplanation && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    AI 쉬운 설명
                  </h4>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                    <p className="text-sm text-foreground leading-relaxed">
                      {selectedSavedItem.aiExplanation}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  이 설명은 AI가 생성한 참고용 정보입니다. 정확한 진단과 치료는 반드시 의료 전문가와 상담하세요.
                </p>
              </div>

              {/* AI Chat Section */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  AI에게 추가 질문하기
                </h4>
                
                {chatMessages.length > 0 && (
                  <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-3 rounded-lg text-sm",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground ml-8"
                            : "bg-secondary text-foreground mr-8"
                        )}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-1 mb-1">
                            <Bot className="h-3 w-3" />
                            <span className="text-xs font-medium">AI</span>
                          </div>
                        )}
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                    ))}
                    {isAiLoading && (
                      <div className="bg-secondary text-foreground mr-8 p-3 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>답변 생성 중...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="예: 부작용이 있나요?"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendChat()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={handleSendChat}
                    disabled={!chatInput.trim() || isAiLoading}
                    className="bg-primary text-primary-foreground"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent text-destructive hover:text-destructive"
                  onClick={() => {
                    setDeleteTarget({ type: "saved", id: selectedSavedItem.id })
                    setShowSavedItemModal(false)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제하기
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground"
                  onClick={() => setShowSavedItemModal(false)}
                >
                  닫기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptySavedState() {
  return (
    <div className="text-center py-6">
      <Bookmark className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
      <p className="text-sm text-muted-foreground mb-4">
        저장한 정보가 없어요<br />
        유용한 질환/약 정보를 저장해보세요!
      </p>
      <Link href="/search">
        <Button variant="outline">정보 탐색하기</Button>
      </Link>
    </div>
  )
}
