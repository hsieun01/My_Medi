const { createClient } = require('@supabase/supabase-js')

// Hardcoded or from env
const supabaseUrl = 'https://bwoeluvuypdpqmixprdn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3b2VsdXZ1eXBkcHFtaXhwcmRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI1MzY4OSwiZXhwIjoyMDg1ODI5Njg5fQ.dDN8TAIxSTyNB0kR6akubdTjWNvyhmib3GQF68sK8iA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
    console.log('Seeding diseases...')
    const diseases = [
        {
            title: 'Hypertension',
            title_ko: '고혈압',
            description: '혈압이 정상 범위보다 지속적으로 높은 상태입니다. 심장, 뇌, 신장 등에 합병증을 유발할 수 있습니다.',
            medical_term: '혈압이 수축기 140mmHg 이상, 이완기 90mmHg 이상으로 지속되는 상태',
            common_symptoms: ['두통', '어지러움', '피로감'],
            emergency_hint: '갑작스러운 심한 두통이나 가슴 통증 발생 시 즉시 응급실을 방문하세요.'
        },
        {
            title: 'Diabetes Mellitus',
            title_ko: '당뇨병',
            description: '인슐린 분비 또는 작용 이상으로 혈당이 높아지는 대사 질환입니다.',
            medical_term: '공복 혈당 126mg/dL 이상, 당화혈색소 6.5% 이상',
            common_symptoms: ['다음', '다뇨', '다식', '체중 감소'],
            emergency_hint: '의식 저하나 심한 탈수 증상 발생 시 즉시 의료진의 도움을 받으세요.'
        },
        {
            title: 'Hyperlipidemia',
            title_ko: '고지혈증',
            description: '혈중 콜레스테롤이나 중성지방이 정상보다 높은 상태입니다.',
            medical_term: '총 콜레스테롤 200mg/dL 이상, LDL 130mg/dL 이상',
            common_symptoms: ['대부분 무증상', '황색판종']
        },
        {
            title: 'Common Cold',
            title_ko: '감기',
            description: '바이러스에 의해 발생하는 상기도 감염 질환입니다.',
            medical_term: '바이러스성 비인두염',
            common_symptoms: ['콧물', '기침', '인후통', '발열'],
            emergency_hint: '고열이 지속되거나 호흡 곤란이 생기면 병원을 방문하세요.'
        }
    ]

    const { error: dError } = await supabase.from('diseases').insert(diseases)
    if (dError) console.error('Diseases seeding error:', dError)
    else console.log('Diseases seeded successfully.')

    console.log('Seeding drugs...')
    const drugs = [
        {
            title: 'Aspirin',
            title_ko: '아스피린',
            description: '혈액 응고를 억제하는 항혈소판제입니다.',
            purpose: '혈전 예방, 심장마비/뇌졸중 예방',
            precaution: '위장 출혈 위험이 있으므로 식후 복용 권장',
            medical_term: '아세틸살리실산, COX-1 억제제'
        },
        {
            title: 'Metformin',
            title_ko: '메트포르민',
            description: '2형 당뇨병 치료의 1차 약물입니다.',
            purpose: '혈당 조절',
            precaution: '신장 기능 확인 필요, 유산증 주의',
            medical_term: '비구아나이드계 혈당강하제'
        },
        {
            title: 'Atorvastatin',
            title_ko: '아토르바스타틴',
            description: '콜레스테롤 생성을 억제하는 스타틴 계열 약물입니다.',
            purpose: '콜레스테롤 감소, 심혈관 질환 예방',
            precaution: '저녁 복용 권장, 근육통 주의',
            medical_term: 'HMG-CoA 환원효소 억제제'
        },
        {
            title: 'Ibuprofen',
            title_ko: '이부프로펜',
            description: '비스테로이드성 소염진통제(NSAIDs)입니다.',
            purpose: '통증 완화, 염증 감소, 해열',
            precaution: '충분한 물과 함께 식후 복용',
            medical_term: 'Propionic acid derivative'
        }
    ]

    const { error: drError } = await supabase.from('drugs').insert(drugs)
    if (drError) console.error('Drugs seeding error:', drError)
    else console.log('Drugs seeded successfully.')
}

seed()
