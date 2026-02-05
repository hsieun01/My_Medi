"use client"

import { useState } from "react"
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

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

// Sample data for diseases and drugs
const diseases = [
  {
    id: "1",
    title: "Hypertension",
    titleKo: "고혈압",
    description: "혈압이 정상 범위(수축기 120mmHg, 이완기 80mmHg)보다 지속적으로 높은 상태입니다. 심장, 뇌, 신장 등에 합병증을 유발할 수 있습니다.",
    medicalTerm: "혈압이 수축기 140mmHg 이상, 이완기 90mmHg 이상으로 지속되는 상태",
    aiExplanation: "심장이 피를 보낼 때 혈관에 가해지는 압력이 정상보다 높은 상태예요. 쉽게 말해 혈관 벽에 무리가 가는 거죠. 오랫동안 방치하면 심장이나 뇌에 문제가 생길 수 있어서 꾸준한 관리가 중요해요."
  },
  {
    id: "2",
    title: "Diabetes Mellitus",
    titleKo: "당뇨병",
    description: "인슐린 분비 또는 작용 이상으로 혈당이 높아지는 대사 질환입니다. 1형과 2형으로 나뉘며, 합병증 예방을 위한 혈당 관리가 중요합니다.",
    medicalTerm: "공복 혈당 126mg/dL 이상, 당화혈색소 6.5% 이상",
    aiExplanation: "우리 몸이 음식에서 얻은 당분을 제대로 사용하지 못하는 상태예요. 인슐린이라는 호르몬이 부족하거나 제대로 작동하지 않아서 생겨요. 식이요법과 운동, 약물로 관리할 수 있어요."
  },
  {
    id: "3",
    title: "Hyperlipidemia",
    titleKo: "고지혈증",
    description: "혈중 콜레스테롤이나 중성지방이 정상보다 높은 상태입니다. 동맥경화의 주요 원인이 됩니다.",
    medicalTerm: "총 콜레스테롤 200mg/dL 이상, LDL 130mg/dL 이상",
    aiExplanation: "피 속에 기름기가 너무 많은 상태예요. 혈관 벽에 기름이 쌓이면 혈관이 좁아지고 딱딱해질 수 있어요. 식습관 개선과 운동이 도움이 돼요."
  }
]

const drugs = [
  {
    id: "1",
    title: "Aspirin",
    titleKo: "아스피린",
    description: "혈액 응고를 억제하는 항혈소판제입니다. 심혈관 질환 예방에 사용됩니다.",
    purpose: "혈전 예방, 심장마비/뇌졸중 예방",
    precaution: "위장 출혈 위험이 있으므로 식후 복용 권장",
    medicalTerm: "아세틸살리실산, COX-1 억제제",
    aiExplanation: "피가 너무 쉽게 굳어서 혈관을 막는 것을 예방하는 약이에요. 심장이나 뇌로 가는 혈관이 막히면 큰 문제가 생길 수 있는데, 이 약이 그걸 예방해줘요. 위에 자극이 될 수 있으니 밥 먹고 드세요."
  },
  {
    id: "2",
    title: "Metformin",
    titleKo: "메트포르민",
    description: "2형 당뇨병 치료의 1차 약물입니다. 간에서 포도당 생성을 억제합니다.",
    purpose: "혈당 조절",
    precaution: "신장 기능 확인 필요, 유산증 주의",
    medicalTerm: "비구아나이드계 혈당강하제",
    aiExplanation: "당뇨병 치료에 가장 많이 쓰이는 약이에요. 간에서 당분이 만들어지는 것을 줄여주고, 몸이 인슐린을 더 잘 사용할 수 있게 도와줘요. 신장이 안 좋으면 주의가 필요해요."
  },
  {
    id: "3",
    title: "Atorvastatin",
    titleKo: "아토르바스타틴",
    description: "콜레스테롤 생성을 억제하는 스타틴 계열 약물입니다.",
    purpose: "콜레스테롤 감소, 심혈관 질환 예방",
    precaution: "간 기능 모니터링 필요, 근육통 발생 시 의사 상담",
    medicalTerm: "HMG-CoA 환원효소 억제제",
    aiExplanation: "우리 몸에서 콜레스테롤이 만들어지는 것을 줄여주는 약이에요. 저녁에 먹으면 효과가 더 좋아요. 드물지만 근육통이 생길 수 있으니 이상하면 의사 선생님께 말씀하세요."
  }
]

interface InfoItem {
  id: string
  title: string
  titleKo: string
  description: string
  medicalTerm: string
  aiExplanation: string
  purpose?: string
  precaution?: string
}

export default function SearchPage() {
  const { saveItem, removeSavedItemByTitle, isSaved } = useMedication()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"disease" | "drug">("disease")
  const [selectedItem, setSelectedItem] = useState<InfoItem | null>(null)
  const [showAiModal, setShowAiModal] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)

  const filteredDiseases = diseases.filter(
    d =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.titleKo.includes(searchQuery)
  )

  const filteredDrugs = drugs.filter(
    d =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.titleKo.includes(searchQuery)
  )

  const handleSave = (item: InfoItem, type: "disease" | "drug") => {
    if (isSaved(item.title)) {
      removeSavedItemByTitle(item.title)
    } else {
      saveItem({
        type,
        title: item.title,
        titleKo: item.titleKo,
        description: item.description,
        aiExplanation: item.aiExplanation
      })
    }
  }

  const handleShowAi = (item: InfoItem) => {
    setSelectedItem(item)
    setChatMessages([])
    setChatInput("")
    setShowAiModal(true)
  }

  const handleSendChat = async () => {
    if (!chatInput.trim() || !selectedItem || isAiLoading) return

    const userMessage = chatInput.trim()
    setChatInput("")
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsAiLoading(true)

    // Simulate AI response (in real app, this would call an AI API)
    setTimeout(() => {
      const responses: Record<string, string> = {
        "부작용": `${selectedItem.titleKo}의 일반적인 부작용으로는 가벼운 두통, 소화불량 등이 있을 수 있어요. 심각한 부작용이 느껴지면 즉시 의사와 상담하세요.`,
        "복용": `${selectedItem.titleKo} 관련 약은 보통 의사의 처방에 따라 복용합니다. 정해진 시간에 규칙적으로 복용하는 것이 중요해요.`,
        "음식": `${selectedItem.titleKo} 관련 약을 복용할 때는 자몽주스를 피하는 것이 좋고, 술은 약효에 영향을 줄 수 있으니 주의하세요.`,
        "default": `${selectedItem.titleKo}에 대해 더 궁금하신 점이 있으시군요! 구체적인 의료 상담은 담당 의사나 약사와 상담하시는 것이 가장 정확합니다. 일반적인 정보는 제가 도와드릴 수 있어요.`
      }
      
      const key = Object.keys(responses).find(k => userMessage.includes(k)) || "default"
      setChatMessages(prev => [...prev, { role: "assistant", content: responses[key] }])
      setIsAiLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen">
      <AppHeader title="정보탐색" />

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        {/* Search Input */}
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "disease" | "drug")}>
          <TabsList className="grid w-full grid-cols-2 mb-6 lg:w-80">
            <TabsTrigger value="disease">질환 정보</TabsTrigger>
            <TabsTrigger value="drug">약 정보</TabsTrigger>
          </TabsList>

          <TabsContent value="disease">
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredDiseases.map(item => (
                <InfoCard
                  key={item.id}
                  item={item}
                  type="disease"
                  isSaved={isSaved(item.title)}
                  onSave={() => handleSave(item, "disease")}
                  onShowAi={() => handleShowAi(item)}
                />
              ))}
            </div>
            {filteredDiseases.length === 0 && (
              <EmptySearchResult query={searchQuery} />
            )}
          </TabsContent>

          <TabsContent value="drug">
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredDrugs.map(item => (
                <InfoCard
                  key={item.id}
                  item={item}
                  type="drug"
                  isSaved={isSaved(item.title)}
                  onSave={() => handleSave(item, "drug")}
                  onShowAi={() => handleShowAi(item)}
                />
              ))}
            </div>
            {filteredDrugs.length === 0 && (
              <EmptySearchResult query={searchQuery} />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* AI Explanation Modal */}
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
            <div className="flex-1 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  원본 의학 용어
                </h4>
                <p className="text-sm bg-secondary/50 p-3 rounded-lg text-foreground">
                  {selectedItem.medicalTerm}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  AI 쉬운 설명
                </h4>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-foreground leading-relaxed">
                    {selectedItem.aiExplanation}
                  </p>
                </div>
              </div>

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
                
                {/* Chat Messages */}
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

                {/* Chat Input */}
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
                  onClick={() => {
                    if (selectedItem && !isSaved(selectedItem.title)) {
                      saveItem({
                        type: activeTab,
                        title: selectedItem.title,
                        titleKo: selectedItem.titleKo,
                        description: selectedItem.description,
                        aiExplanation: selectedItem.aiExplanation
                      })
                    }
                    setShowAiModal(false)
                  }}
                >
                  <Star className={cn(
                    "h-4 w-4 mr-2",
                    selectedItem && isSaved(selectedItem.title) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : ""
                  )} />
                  저장하기
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

interface InfoCardProps {
  item: InfoItem
  type: "disease" | "drug"
  isSaved: boolean
  onSave: () => void
  onShowAi: () => void
}

function InfoCard({ item, type, isSaved, onSave, onShowAi }: InfoCardProps) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">
            {item.titleKo}
            <span className="font-normal text-muted-foreground ml-2 text-sm">
              ({item.title})
            </span>
          </h3>
          <div className="w-full h-px bg-border my-2" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>
          {type === "drug" && item.precaution && (
            <p className="text-sm text-amber-600 mt-2">
              주의: {item.precaution}
            </p>
          )}
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
