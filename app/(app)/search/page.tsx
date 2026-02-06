"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Star, Bot, AlertTriangle, Send, Loader2 } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMedication } from "@/lib/medication-context"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
// removed server action imports

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface InfoItem {
  id: string
  title: string
  titleKo: string
  description: string
  medicalTerm: string
  aiExplanation?: string
  purpose?: string
  precaution?: string
  type: "disease" | "drug"
}

export default function SearchPage() {
  const { saveItem, removeSavedItemByTitle, isSaved } = useMedication()
  const [supabase] = useState(() => createClient())
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"disease" | "drug">("disease")
  const [diseases, setDiseases] = useState<InfoItem[]>([])
  const [drugs, setDrugs] = useState<InfoItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InfoItem | null>(null)
  const [showAiModal, setShowAiModal] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [currentAiExplanation, setCurrentAiExplanation] = useState("")

  const fetchResults = useCallback(async (query: string) => {
    setIsLoading(true)
    try {
      if (activeTab === "disease") {
        const { data, error } = await supabase
          .from("diseases")
          .select("*")
          .or(`title.ilike.%${query}%,title_ko.ilike.%${query}%`)
          .limit(20)

        if (!error && data) {
          setDiseases(data.map(d => ({
            id: d.id,
            title: d.title,
            titleKo: d.title_ko,
            description: d.description,
            medicalTerm: d.medical_term,
            type: "disease"
          })))
        }
      } else {
        const { data, error } = await supabase
          .from("drugs")
          .select("*")
          .or(`title.ilike.%${query}%,title_ko.ilike.%${query}%`)
          .limit(20)

        if (!error && data) {
          setDrugs(data.map(d => ({
            id: d.id,
            title: d.title,
            titleKo: d.title_ko,
            description: d.description,
            medicalTerm: d.medical_term,
            purpose: d.purpose,
            precaution: d.precaution,
            type: "drug"
          })))
        }
      }
    } catch (err) {
      console.error("Search fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, activeTab])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchResults])

  const handleSave = (item: InfoItem) => {
    if (isSaved(item.title)) {
      removeSavedItemByTitle(item.title)
    } else {
      saveItem({
        type: item.type,
        title: item.title,
        titleKo: item.titleKo,
        description: item.description,
        aiExplanation: currentAiExplanation || undefined
      })
    }
  }

  const handleShowAi = async (item: InfoItem) => {
    setSelectedItem(item)
    setChatMessages([])
    setChatInput("")
    setCurrentAiExplanation("")
    setShowAiModal(true)
    setIsAiLoading(true)

    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({
        action: "explanation",
        targetId: item.id,
        targetType: item.type,
        medicalTerm: item.medicalTerm || item.description,
        targetName: item.titleKo || item.title
      })
    })

    const data = await res.json()
    setCurrentAiExplanation(data.content)
    setIsAiLoading(false)
  }

  const handleSendChat = async () => {
    if (!chatInput.trim() || !selectedItem || isAiLoading) return

    const userMessage = chatInput.trim()
    setChatInput("")
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsAiLoading(true)

    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({
        action: "chat",
        chatHistory: chatMessages,
        query: userMessage,
        targetName: selectedItem.titleKo || selectedItem.title,
        context: `${selectedItem.medicalTerm}. ${currentAiExplanation}`
      })
    })

    const data = await res.json()
    setChatMessages(prev => [...prev, { role: "assistant", content: data.content }])
    setIsAiLoading(false)
  }

  return (
    <div className="min-h-screen">
      <AppHeader title="정보탐색" />

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="relative mb-6 lg:mb-8 lg:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="질환명 또는 약 이름을 검색하세요"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-full bg-card border-border"
          />
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "disease" | "drug")}>
          <TabsList className="grid w-full grid-cols-2 mb-6 lg:w-80">
            <TabsTrigger value="disease">질환 정보</TabsTrigger>
            <TabsTrigger value="drug">약 정보</TabsTrigger>
          </TabsList>

          <TabsContent value="disease">
            <div className="grid gap-4 lg:grid-cols-2">
              {diseases.map(item => (
                <InfoCard
                  key={item.id}
                  item={item}
                  type="disease"
                  isSaved={isSaved(item.title)}
                  onSave={() => handleSave(item)}
                  onShowAi={() => handleShowAi(item)}
                />
              ))}
            </div>
            {!isLoading && diseases.length === 0 && (
              <EmptySearchResult query={searchQuery} />
            )}
            {isLoading && <SearchLoadingState />}
          </TabsContent>

          <TabsContent value="drug">
            <div className="grid gap-4 lg:grid-cols-2">
              {drugs.map(item => (
                <InfoCard
                  key={item.id}
                  item={item}
                  type="drug"
                  isSaved={isSaved(item.title)}
                  onSave={() => handleSave(item)}
                  onShowAi={() => handleShowAi(item)}
                />
              ))}
            </div>
            {!isLoading && drugs.length === 0 && (
              <EmptySearchResult query={searchQuery} />
            )}
            {isLoading && <SearchLoadingState />}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
        <DialogContent className="max-w-md lg:max-w-lg mx-auto max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              AI 쉬운 설명
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  원본 의학 용어
                </h4>
                <p className="text-sm bg-secondary/50 p-3 rounded-lg text-foreground">
                  {selectedItem.medicalTerm || selectedItem.description}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  AI 쉬운 설명
                </h4>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg min-h-[80px] flex items-center justify-center">
                  {isAiLoading && !currentAiExplanation ? (
                    <div className="flex items-center gap-2 text-primary">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>설명 생성 중...</span>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground leading-relaxed">
                      {currentAiExplanation}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  이 설명은 AI가 생성한 참고용 정보입니다. 정확한 진단과 치료는 반드시 의료 전문가와 상담하세요.
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  AI에게 추가 질문하기
                </h4>

                {chatMessages.length > 0 && (
                  <div className="space-y-3 mb-4 max-h-40 overflow-y-auto scrollbar-hide">
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
                    {isAiLoading && chatMessages.length > 0 && (
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
                  className="flex-1 bg-transparent"
                  onClick={() => handleSave(selectedItem)}
                >
                  <Star className={cn(
                    "h-4 w-4 mr-2",
                    isSaved(selectedItem.title)
                      ? "fill-yellow-400 text-yellow-400"
                      : ""
                  )} />
                  {isSaved(selectedItem.title) ? "저장됨" : "저장하기"}
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground"
                  onClick={() => setShowAiModal(false)}
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

function InfoCard({ item, type, isSaved, onSave, onShowAi }: { item: InfoItem, type: string, isSaved: boolean, onSave: () => void, onShowAi: () => void }) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              {item.titleKo}
              <span className="font-normal text-muted-foreground ml-2 text-sm">
                ({item.title})
              </span>
            </h3>
            <div className="w-full h-px bg-border my-2" />
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {item.description}
            </p>
            {type === "drug" && item.precaution && (
              <p className="text-sm text-amber-600 mt-2 font-medium">
                주의: {item.precaution}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onShowAi}
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 hover:from-blue-600 hover:to-indigo-700 hover:text-white"
        >
          <Bot className="h-4 w-4 mr-2" />
          AI 쉬운 설명 보기
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className={cn(
            "px-3",
            isSaved && "text-yellow-500"
          )}
        >
          <Star className={cn(
            "h-4 w-4",
            isSaved ? "fill-yellow-400 text-yellow-400" : ""
          )} />
        </Button>
      </div>
    </div>
  )
}

function EmptySearchResult({ query }: { query: string }) {
  return (
    <div className="text-center py-12">
      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
      <p className="text-muted-foreground">
        {query
          ? `"${query}"에 대한 검색 결과가 없습니다`
          : "검색어를 입력해주세요"
        }
      </p>
    </div>
  )
}

function SearchLoadingState() {
  return (
    <div className="flex items-center justify-center py-12 text-primary">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}
