import re
import json
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from langchain_community.tools.tavily_search import TavilySearchResults
from langgraph.prebuilt import create_react_agent

# 1. 환경 설정
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# 2. 모델 설정
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-preview-09-2025", 
    temperature=0,
    google_api_key=GOOGLE_API_KEY
)

search_tool = TavilySearchResults(k=3) 
tools = [search_tool]

# 3. 에이전트 시스템 지침 (기존 로직 유지)
system_instructions = """
<role>
당신은 대한민국 식재료 물가 전문가 및 세계요리 전문입니다. 
</role>

<task>
당신은 대한민국 식재료 물가 전문가 및 세계요리 전문입니다. 
</task>

<constraints>
[핵심 필터링 및 계산 지침]
1. **완제품 및 밀키트 제외**: '밀키트', '요리 세트', '완제품', '조리 완료 상품'은 절대 제외하고 '순수 단품 원재료'만 검색하세요.
2. **수량 처리**: 
   - 숫자가 명시된 수량은 해당 수량 전체의 비례 가격을 계산합니다.
   - '약간', '적당량' 또는 수량 미정은 해당 음식의 '1인분 적정량'을 추론하여 계산합니다.
3. **우선 채널**: '마켓컬리','쿠팡'과 'SSG닷컴'의 실시간 가격을 우선 참조합니다.
4. **출력 규칙**: JSON 응답 시 `final_name` 필드에는 **사용자가 입력한 재료명을 틀리지 않고 그대로** 넣으세요.
5. **단위 변환 및 추론**: '한 컵', '한 줌', '약간' 등 무게가 명확하지 않은 단위는 요리 전문가로서 표준 중량(g)으로 환산하여 계산하세요.
6. **검색어 교정**: 검색 전 재료명이 올바른 표준어인지 확인하세요. (예: '돼지 앞다리산' -> '돼지 앞다리살'로 교정)
   - 예: 양배추 1컵 -> 채 썬 양배추 약 70~80g으로 환산하여 가격 산출.
   - 예: 마늘 5쪽 -> 약 30g으로 환산.
   - 예: 대파 1토막 -> 약 80g으로 환산.
7. **url**: 상품의 상세 페이지 url을 반환하세요. 재료의 검색어를 적어서는 안됩니다.
    - 쿠팡과 SSG의 검색 결과를 우선으로 반환해주세요.
    - 마켓컬리: https://www.kurly.com/goods/(정확한 상품코드)
8. output은 반드시 json 형식으로 반환하세요.
</constraints>

<output_format>
{
  "final_name": "사용자 입력 재료명 그대로",
  "quantity": "사용자 입력 수량 그대로",
  "price": 정수(계산된 가격),
  "link": "상품 링크"
}
</output_format>
"""

agent_app = create_react_agent(llm, tools, prompt=system_instructions)

# 4. 레시피 파싱 함수 (기존 로직 유지)
def parse_ingredients(input_text):
    blocks = re.split(r'## 음식명:', input_text)[1:]
    all_ingredients = []
    for block in blocks:
        lines = block.strip().split('\n')
        if not lines: continue
        food_name = lines[0].strip()
        ingredients = []
        for line in lines[1:]:
            line = line.strip()
            if not line or any(x in line for x in ['주재료', '부재료', '조미료', '###']):
                continue
            if line.startswith('- ') or line.startswith('  - '):
                content = line.replace('- ', '').strip()
                m = re.match(r'(.+?)\s+(\d+.*|[가-힣]*약간|[가-힣]*적당량)', content)
                if m:
                    name, qty = m.group(1).strip(), m.group(2).strip()
                    is_fixed = bool(re.search(r'\d', qty)) and "약간" not in qty and "적당량" not in qty
                    ingredients.append({"original_full_name": name, "quantity": qty, "is_fixed": is_fixed})
                else:
                    ingredients.append({"original_full_name": content, "quantity": "수량미정", "is_fixed": False})
        all_ingredients.append({"food_name": food_name, "ingredients": ingredients})
    return all_ingredients

# 5. 개별 재료 동기 처리 함수
def process_ingredient(ing, food_name):
    if ing["is_fixed"]:
        query = f"마켓컬리/쿠팡/SSG '{ing['original_full_name']}' 순수 원재료 단품 검색. '{ing['quantity']}' 전체 분량 가격 계산. 출력 재료명은 반드시 '{ing['original_full_name']}'으로 할 것."
    else:
        query = f"마켓컬리/쿠팡/SSG '{ing['original_full_name']}' 순수 원재료 단품 검색. 1인분 분량 가격 추론. 출력 재료명은 반드시 '{ing['original_full_name']}'으로 할 것."

    try:
        # 동기 메서드 invoke 사용
        result = agent_app.invoke({"messages": [HumanMessage(content=query)]})
        last_msg = result["messages"][-1]
        
        if isinstance(last_msg.content, list):
            text_content = ""
            for item in last_msg.content:
                if isinstance(item, dict):
                    text_content += item.get("text", "")
                elif isinstance(item, str):
                    text_content += item
        else:
             text_content = str(last_msg.content)
        
        json_match = re.search(r'\{.*\}', text_content, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
            return {"name": ing['original_full_name'], "quantity": ing['quantity'], "price": int(data.get("price", 0)), "link": data.get("link")}
    except Exception as e:
        print(f"Error processing {ing['original_full_name']}: {e}")
        return None

# 6. 메인 실행 함수 (동기 방식)
def run_analysis(input_text):
    recipes = parse_ingredients(input_text)
    
    for recipe in recipes:
        print(f"\n🥘 '{recipe['food_name']}' 재료 단가 계산 (순차 검색 중...)")
        print("=" * 60)
        
        results = []
        for ing in recipe["ingredients"]:
            res = process_ingredient(ing, recipe["food_name"])
            results.append(res)
        
        total_cost = 0
        for res in results:
            if res:
                print(f"재료명: {res['name']}")
                print(f"가격: {res['price']:,}원")
                print(f"상품링크: {res['link']}\n")
                total_cost += res['price']

        print("-" * 60)
        print(f"💰 최종 예상 총액: {total_cost:,}원")
        print("=" * 60)
    return results, recipes, total_cost