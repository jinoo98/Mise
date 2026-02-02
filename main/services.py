from typing import Annotated, TypedDict, List
import time
import yt_dlp
from openai import OpenAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_tavily import TavilySearch
from langchain_community.tools import WikipediaQueryRun
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.utilities import WikipediaAPIWrapper
from langchain.agents import create_agent
from pydub import AudioSegment
from django.conf import settings
import os

from django.conf import settings
openai_key = settings.OPENAI_API_KEY
tavily_key = settings.TAVILY_API_KEY
youtube_key = settings.YOUTUBE_API_KEY
hf_token = settings.HF_TOKEN

# 1. 상태(State) 정의: 각 단계가 공유할 데이터 바구니
class RecipeSchema(TypedDict):
    prompt: str
    youtuber: List[str]
    title: List[str]
    url: List[str]
    transcript: List[str]
    recipe: List[str]
    tip: List[str]
    is_satisfactory: bool
    
# 2. 첫 프롬프트 작성 함수
def get_ai_prompt(state: RecipeSchema):
    # def get_prompt_refiner():
    #     llm = ChatOpenAI(model="gpt-4o", temperature=0.7) # 창의성이 필요하므로 온도를 살짝 높임
        
    #     refiner_prompt = ChatPromptTemplate.from_template(
    #         "당신은 {role} 입니다.\n\n"
    #         "다음 요청을 분석해서 LLM이 최고의 요리 레시피 요약을 수행할 수 있도록 시스템 프롬프트를 정교하게 재작성해주세요.\n\n"
    #         "output은 포함할 내용만 작성해주세요\n\n"
    #         "포함할 내용: {content}"
    #         "output_example_1: {output_example1}"
    #         "output_example_2: {output_example2}"
    #     )
        
    #     return refiner_prompt | llm | StrOutputParser()
        
    # role = "프롬프트 엔지니어링 전문가"
    # content = "음식명, 재료(종류별 분류), 요리과정"
    # output_example1 = "## 음식명: 빠니까 매우사 (Sicilian Offal Burger)\n\n### 재료\n- 주재료: \n  - 한우 지라 300g\n  - 한우 허파 500g\n- 부재료: \n  - 세몰라 가루 250g\n  - 더블 제로 밀가루 250g\n  - 드라이 이스트 7g\n  - 올리브 오일 30ml\n  - 까초 카발로 치즈 (적당량)\n  - 레몬 (1개)\n  - 라드 (적당량)\n- 조미료: \n  - 소금 (적당량)\n  - 월계수 잎 (6장)\n\n### 과정\n1. **내장 준비하기**: 한우 지라와 허파를 흐르는 물에 잘 씻어줍니다. 특히 허파는 물컹한 질감이 있으니 주의해서 씻어주세요.\n   \n2. **내장 삶기**: 큰 곰솥에 지라와 허파를 넣고, 소금과 월계수 잎을 추가한 후 물을 부어 30분에서 1시간 동안 끓입니다. 이때 지라가 가라앉고 허파는 떠오르므로, 중간중간 뒤집어 주어야 합니다.\n\n3. **빵 반죽하기**: 세몰라 가루와 더블 제로 밀가루를 섞고, 소금을 추가합니다. 따로 준비한 우유, 물, 설탕, 드라이 이스트를 섞어 반죽에 합쳐줍니다. 올리브 오일도 추가하여 20분간 손으로 반죽합니다.\n\n4. **1차 발효**: 반죽을 랩으로 덮고 30분간 발효시킵니다. 발효가 끝나면 반죽이 부풀어 오른 것을 확인합니다.\n\n5. **빵 모양 만들기**: 발효된 반죽을 8등분하여 둥글게 만듭니다. 참깨를 넉넉히 깔아놓고, 빵에 물을 발라서 눌러줍니다. 1시간 동안 2차 발효를 진행합니다.\n\n6. **빵 굽기**: 200도 오븐에서 빵을 노릇노릇하게 구워줍니다. 구워진 빵은 겉이 바삭하고 속은 부드럽습니다.\n\n7. **내장 조리하기**: 삶은 내장을 잘라서 구리냄비에 넣고, 라드를 추가하여 약한 불에서 천천히 익힙니다. 이때 고소한 맛이 배어들도록 합니다.\n\n8. **버거 조립하기**: 구운 빵에 내장, 까초 카발로 치즈, 레몬 조각을 넣고, 원하시는 대로 조합하여 완성합니다.\n\n9. **서빙**: 빠니까 매우사를 접시에 담고, 추가로 레몬즙을 뿌려서 맛을 더해줍니다. \n\n이제 여러분의 손으로 만든 시칠리아 전통 내장버거, 빠니까 매우사를 즐겨보세요! 맛있게 드세요!"
    # output_example2 = "## 음식명: 두바이 쫀득쿠키\n\n### 재료\n- 주재료: \n  - 화이트 초콜릿 200g\n  - 피스타치오 스프레드 100g\n  - 마시멜로 150g\n- 부재료: \n  - 버터 50g\n  - 타지분유 30g (선택 사항)\n- 조미료: \n  - 소금 한 꼬집 (선택 사항)\n\n### 과정\n1. **재료 준비**: 모든 재료를 계량하여 준비합니다. 화이트 초콜릿, 피스타치오 스프레드, 마시멜로, 버터, 타지분유를 준비합니다.\n   \n2. **버터 녹이기**: 중불로 팬에 버터를 넣고 녹입니다. 버터가 완전히 녹으면 불을 끄고 잠시 식힙니다.\n\n3. **화이트 초콜릿 녹이기**: 화이트 초콜릿을 중탕으로 녹입니다. 부드럽게 녹을 때까지 저어줍니다.\n\n4. **재료 혼합**: 녹인 버터와 화이트 초콜릿을 큰 볼에 넣고 잘 섞습니다. 그 후 피스타치오 스프레드와 마시멜로를 추가하고 고루 섞어줍니다.\n\n5. **타지분유 추가**: 선택 사항으로 타지분유를 넣고 잘 섞어줍니다. 이 단계에서 소금을 추가하면 맛이 더욱 풍부해집니다.\n\n6. **모양 만들기**: 혼합물이 잘 섞이면 손으로 적당한 크기로 덩어리를 만들어 동그랗게 만듭니다. 이때 모양은 너무 규칙적이지 않아도 괜찮습니다.\n\n7. **냉장고에 굳히기**: 만들어진 쿠키 반죽을 냉장고에 넣어 약 30분간 굳힙니다. 이 과정에서 쿠키가 단단해집니다.\n\n8. **완성 및 시식**: 냉장고에서 꺼낸 후, 원하는 크기로 잘라서 맛있게 즐깁니다. \n\n이렇게 두바이 쫀득쿠키가 완성되었습니다! 부드럽고 쫀득한 식감이 매력적인 이 쿠키는 가족과 함께 즐기기에 안성맞춤입니다. 맛있게 드세요!"
    
    # refiner = get_prompt_refiner()
    # ai_prompt = refiner.invoke({"role": role, 
    #                             "content": content,
    #                             "output_example1": output_example1,
    # print(ai_prompt)
    ai_prompt = '''
<role>
당신은 요리 전문가입니다. 주어진 유튜브 영상의 내용을 분석하여 레시피를 추출해주세요.
</role>

<description>
- output_example1과 같은 형식으로 레시피를 추출해주세요.
- 음식명은 ## 음식명: 형식으로 표시해주세요.
- 음식명은 무조건 표시하시고 만약 영상에서 음식명이 나오지 않는다면 영상의 내용을 바탕으로 음식명을 지어주거나 영상의 제목에서 음식명을 가져와주세요.
- 재료는 주재료, 부재료, 조미료로 나누어주세요.
- 재료의 양은 정확하게 표시해주세요. 만약 양이 정확하지 않다면 대략적인 양을 표시해주세요.
- 과정은 단계별로 나누어주세요.
- 유튜브 내용중 정확한 조리 시간이 나온다면 조리 과정에 표시해주세요.
- 조리 시간과 난이도는 조리 과정을 통해 유추하여 적어주세요.
- 난이도는 쉬움/보통/어려움으로 표시해주세요.
</description>

<output_example1>
## 음식명: [음식 이름]

### 재료
- 주재료:
- [주재료 목록]
- 부재료:
- [부재료 목록]
- 조미료:
- [조미료 목록]

### 과정
1. **[첫 번째 단계 이름]**: [첫 번째 단계 설명]
2. **[두 번째 단계 이름]**: [두 번째 단계 설명]
3. **[세 번째 단계 이름]**: [세 번째 단계 설명]
4. **[네 번째 단계 이름]**: [네 번째 단계 설명]
5. **[다섯 번째 단계 이름]**: [다섯 번째 단계 설명]
6. **[여섯 번째 단계 이름]**: [여섯 번째 단계 설명]
7. **[일곱 번째 단계 이름]**: [일곱 번째 단계 설명]
8. **[여덟 번째 단계 이름]**: [여덟 번째 단계 설명]
9. **[아홉 번째 단계 이름]**: [아홉 번째 단계 설명]

### 조리 시간: [조리 시간]

### 난이도: [쉬움/보통/어려움]
</output_example1>
'''

    return {"prompt": ai_prompt}
    
# 3. 유튜브 오디오 추출 함수
def download_youtube_audio(url, count, output_filename="temp_audio"):
    cookie_path = os.path.join(settings.BASE_DIR, 'cookies.txt')
    base_path = f"{output_filename}_{count}"
    mp3_path = f"{base_path}.mp3"
    
    # 기존 파일 삭제 (충돌 방지)
    for ext in ['.mp3', '.webm', '.m4a', '']:
        path = base_path + ext
        if os.path.exists(path):
            try:
                os.remove(path)
                print(f"🗑️ 기존 파일 삭제됨: {path}")
            except Exception as e:
                print(f"⚠️ 기존 파일 삭제 실패: {path}, 에러: {e}")

    ydl_opts = {
        'format': 'ba/b',
        'quiet': False,
        'no_warnings': False,
        'nocheckcertificate': True,
        'cookiefile': cookie_path,
        'sleep_interval': 1,
        'max_sleep_interval': 3,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': base_path,
    }
    
    try:
        print(f"🚀 yt-dlp 다운로드 시작: {url}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        
        if os.path.exists(mp3_path):
            print("✅ 다운로드 및 변환 성공!")
            return mp3_path
        else:
            print("❌ 다운로드는 된 것 같으나 mp3 파일이 생성되지 않았습니다.")
            return False
            
    except Exception as e:
        print(f"❌ 다운로드/변환 중 치명적 에러: {e}")
        return False

# 4. Whisper로 텍스트 변환 함수
def text_conversion_with_whisper(state: RecipeSchema):
    client = OpenAI()
    
    # 오디오 다운로드
    print("--- 오디오 추출 중 ---")
    audio_file_path_list = list()
    # count=0
    # for count, url in enumerate(state['url']):
    #     print(f"🔎 [{count+1}번 유튜브] 추출 중...")
    #     audio_file_path_list.append(download_youtube_audio(url, count))
    for count, url in enumerate(state['url']):
        print(f"🔎 [{count+1}번 유튜브] 추출 시도 중...")
        
        success = False
        attempts = 0
        max_attempts = 3 # 최대 3번까지 재시도
        
        while not success and attempts < max_attempts:
            # download_youtube_audio 함수 실행
            result = download_youtube_audio(url, count)
            
            if result != False:
                audio_file_path_list.append(result)
                success = True
            else:
                attempts += 1
                print(f"⚠️ {attempts}회차 실패... 3초 후 재시도합니다.")
                time.sleep(3) # 서버 부하 방지를 위한 대기
        
        if not success:
            print(f"❌ [{count+1}번] 결국 다운로드에 실패했습니다. 다음 영상으로 넘어갑니다.")
            audio_file_path_list.append(None)
            continue
        
    # Whisper API로 텍스트 변환
    print("--- Whisper 시작 ---")
    transcript_list = list()
    for i, audio_file_path in enumerate(audio_file_path_list):
        if audio_file_path is None:
            print(f"⚠️ [{i+1}번 유튜브] 오디오 파일이 없어 분석을 건너뜁니다.")
            transcript_list.append("오디오 추출 실패로 분석 불가")
            continue

        print(f"🔎 [{i+1}번 유튜브] 분석 중...")
        try:
            file_size = os.path.getsize(audio_file_path)
            
            if file_size > 25 * 1024 * 1024:  # 25MB보다 크면 쪼개기
                print(f"⚠️ 파일이 너무 큽니다 ({file_size} bytes). 분할 전송을 시작합니다...")
                audio = AudioSegment.from_file(audio_file_path)
                
                # 10분(600,000ms) 단위로 분할
                ten_minutes = 10 * 60 * 1000
                chunks = [audio[i:i + ten_minutes] for i in range(0, len(audio), ten_minutes)]
                
                full_text = ""
                for j, chunk in enumerate(chunks):
                    chunk_path = f"temp_chunk_{j}.mp3"
                    chunk.export(chunk_path, format="mp3")
                    
                    with open(chunk_path, "rb") as f:
                        response = client.audio.transcriptions.create(
                            model="whisper-1",
                            file=f,
                            language="ko"
                        )
                        full_text += response.text + " "
                    if os.path.exists(chunk_path):
                        os.remove(chunk_path) # 사용한 조각 삭제
                transcript_list.append(full_text.strip())
                
            else:
                # 25MB 미만이면 기존처럼 한 번에 전송
                with open(audio_file_path, "rb") as audio_file:
                    response = client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        language="ko"
                    )
                    transcript_list.append(response.text)
        except Exception as e:
            print(f"❌ [{i+1}번 유튜브] Whisper 분석 중 에러 발생: {e}")
            transcript_list.append(f"분석 중 에러 발생: {e}")
    
    # 임시 파일 삭제
    for rf in audio_file_path_list:
        if rf and os.path.exists(rf):
            try:
                os.remove(rf)
            except Exception as e:
                print(f"⚠️ 파일 삭제 실패 ({rf}): {e}")
    return {'transcript': transcript_list}
    
# 5. 레시피 요약 함수
def summation_recipe(state: RecipeSchema):
    
    # LLM 요약
    print("--- 레시피 정리 중 ---")
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    prompt = ChatPromptTemplate.from_template(
        "{ai_prompt}:\n\n{context}"
    )
    
    chain = prompt | llm | StrOutputParser()

    inputs = [{"ai_prompt": state['prompt'],
               "context": script} for script in state['transcript']]

    return {'recipe': chain.batch(inputs)}

# 6. 레시피 검토 함수
def check_recipe(state: RecipeSchema):

    print("--- 검수 중 (누락 확인) ---")
    for i, content in enumerate(state['recipe']):
        if "음식명" not in content and "재료" not in content and "과정" not in content and len(content) < 100:
            print("--- 🚫누락 발견 다시 전 단계로 돌아갑니다🚫 ---")
            return {"is_satisfactory": False}
            
    print("--- ✅ 검수 완료 ---")
    return {"is_satisfactory": True}

def decide_next_step(state: RecipeSchema):
    if state["is_satisfactory"]:
        return "next"
    else:
        return "before"

# 7. 요리 정보 및 팁 serch agent 함수
def search_agent(state: RecipeSchema):

    model = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    search = TavilySearchResults(k=2)
    wikipedia = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper())
    tools = [search, wikipedia]

    agent_app = create_agent(model, tools)

    all_tips = []

    output_example1 = "### 음식 정보: 빠니까 매우사 (Sicilian Offal Burger)\n\n**빠니까 매우사**는 시칠리아의 전통적인 내장 요리로, 주로 한우의 내장인 지라(간)와 허파를 사용하여 만든 버거입니다. 이 요리는 시칠리아의 거리 음식 중 하나로, 일반적으로 부드러운 빵에 내장과 치즈, 레몬 조각을 넣어 서빙됩니다. 이와 유사한 요리로는 **Pani câ meusa**가 있으며, 이는 삶은 송아지 허파와 비장을 사용한 샌드위치입니다. 빠니까 매우사는 시칠리아의 전통적인 요리로, 지역 주민들 사이에서 인기가 높습니다.\n\n### 요리 팁 요약\n\n1. **신선한 재료 선택**: 내장 요리를 할 때는 신선한 재료를 사용하는 것이 중요합니다. 특히, 유기농 및 풀을 먹인 고기를 선택하면 더 좋은 맛과 영양을 얻을 수 있습니다.\n\n2. **적절한 준비**: 간이나 신장을 우유나 레몬 물에 담가 두면 강한 맛이 완화됩니다. 또한, 결합 조직을 잘라내는 것이 좋습니다.\n\n3. **조리 방법**: 내장 부위에 따라 조리 방법이 다릅니다. 간과 심장은 빠르게 구워야 하고, 샹크나 혀는 느리게 조리하는 것이 좋습니다.\n\n4. **보관**: 내장은 매우 부패하기 쉬우므로 구매 후 1-2일 이내에 조리하는 것이 좋습니다. 조리 후에는 빠르게 식혀서 냉장 보관해야 합니다.\n\n5. **다양한 요리법**: 내장을 활용한 다양한 요리법이 있으며, 예를 들어 간을 양파와 함께 볶거나, 샹크를 레드 와인과 함께 조리하는 방법이 있습니다.\n\n이러한 팁을 통해 빠니까 매우사를 더욱 맛있고 건강하게 즐길 수 있습니다!"
    output_example2 = "### 음식 정보: 두바이 쫀득쿠키 정보\n\n 두바이 쫀득쿠키는 주로 화이트 초콜릿과 피스타치오 스프레드를 사용하여 만들어지는 부드럽고 쫀득한 쿠키입니다. 이 쿠키는 마시멜로의 쫄깃한 식감과 화이트 초콜릿의 달콤함이 조화를 이루며, 피스타치오의 고소한 맛이 더해져 독특한 풍미를 제공합니다. 이러한 조합은 가족과 친구들과 함께 나누기 좋은 간식으로 인기가 높습니다.\n\n### 요리 팁 요약\n\n1. **재료 준비**: 쿠키의 질감을 결정짓는 중요한 요소는 재료의 비율입니다. 특히, 버터는 반드시 실온에서 부드럽게 한 후 사용해야 하며, 설탕의 종류도 중요합니다. 갈색 설탕을 사용하면 더 쫀득한 쿠키를 만들 수 있습니다.\n\n2. **반죽 냉장**: 쿠키 반죽을 최소 30분에서 24시간 동안 냉장하면 맛이 깊어지고, 쿠키가 고르게 구워지는 데 도움이 됩니다.\n\n3. **굽기 기술**: 쿠키를 약간 덜 구워서 오븐에서 꺼내면, 쿠키가 식으면서도 부드럽고 쫀득한 식감을 유지할 수 있습니다. 또한, 쿠키를 굽는 동안 가장자리가 갈색으로 변할 때까지 구워야 합니다.\n\n4. **저장 방법**: 쿠키를 밀폐 용기에 보관하면 부드러운 식감을 유지할 수 있습니다. 또한, 용기에 빵 조각을 추가하면 수분을 유지하는 데 도움이 됩니다.\n\n5. **반죽 다루기**: 반죽을 과도하게 섞지 않도록 주의해야 하며, 이는 글루텐 형성을 줄여 쿠키가 더 쫀득해지도록 합니다.\n\n이러한 팁들을 활용하면 두바이 쫀득쿠키를 더욱 맛있게 만들 수 있습니다!"
    print("--- 레시피 검토 시작 ---")    
    print(f"🔄 총 {len(state['recipe'])}개의 레시피 검토를 시작합니다...")

    for i, single_recipe in enumerate(state['recipe']):
        print(f"🔎 [{i+1}번 레시피] 분석 중...")

        
        input_msg = f"""
                        너는 '요리 과학(Culinary Science)'과 '음식 문화사'에 정통한 수석 셰프 분석가야. 
                        제공된 레시피를 분석하여, 단순히 아는 내용을 나열하지 말고 '심층 검색'을 통해 아래 3가지 요소를 디테일하게 작성해줘.
                        
                        ### 음식 정보: 
                           - 이 레시피가 전통 방식인지, 혹은 특정 요리사나 트렌드(예: 저탄고지, 비건, 퓨전)에 의한 변형 방식인지 위키피디아에서 찾아 설명해줘.
                           
                        ### 요리 팁 요약: 
                           - 이 레시피의 '핵심 식재료'가 가진 특성을 최대로 살리는 법을 인터넷에서 검색해줘. 
                           - (예: 당근면이라면 '비타민 흡수율과 조리 시간', 고기라면 '마이야르 반응과 레스팅 시간' 등 식재료에 맞는 맞춤형 팁)
                           - 초보자가 이 요리를 할 때 가장 많이 실수하는 부분(Texture, 온도 관리, 간 조절 등)을 구체적인 수치(분, 초, 온도 등)와 함께 제시해줘.
                        예시1: {output_example1}
                        예시2: {output_example2}
                        [대상 레시피]:
                        {single_recipe}
                    """

        response = agent_app.invoke({"messages": [HumanMessage(content=input_msg)]})
        
        tip_result = response["messages"][-1].content
        all_tips.append(tip_result)

    return { "tip": all_tips }

# 8. 마지막 확인 함수
def check_tip(state: RecipeSchema):

    print("--- 검수 중 (팁 누락 확인) ---")
    for i, content in enumerate(state['tip']):
        if "음식 정보" not in content and "요리 팁 요약" not in content and len(content) < 100:
            print("--- 🚫누락 발견 다시 전 단계로 돌아갑니다🚫 ---")
            return {"is_satisfactory": False}

    print("--- ✅ 검수 완료 ---")
    print("--- END ---")
    return {"is_satisfactory": True}

from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

def start_langgraph_workflow():
    workflow = StateGraph(RecipeSchema)

    # 노드 추가
    workflow.add_node("start_prompt", get_ai_prompt)
    workflow.add_node("text_conversion", text_conversion_with_whisper)
    workflow.add_node("summation", summation_recipe)
    workflow.add_node("check_recipe", check_recipe)
    workflow.add_node("agent", search_agent)
    workflow.add_node("check_tip", check_tip)

    # 연결 (엣지)
    workflow.set_entry_point("start_prompt") # 시작점
    workflow.add_edge("start_prompt", "text_conversion")
    workflow.add_edge("text_conversion", "summation")
    workflow.add_edge("summation", "check_recipe")
    workflow.add_conditional_edges(
        "check_recipe",
        decide_next_step,
        {
            "next": "agent",
            "before": "summation" 
        }
    )
    workflow.add_edge("agent", "check_tip")
    workflow.add_conditional_edges(
        "check_tip",
        decide_next_step,
        {
            "next": END,
            "before": "agent" 
        }
    )


    return workflow.compile()

from googleapiclient.discovery import build

def get_channel_id(channel_name):
    youtube = build("youtube", "v3", developerKey=youtube_key)

    request = youtube.search().list(
        q=channel_name,
        part="snippet",
        type="channel",
        maxResults=1
    )
    response = request.execute()

    if response['items']:
        channel_id = response['items'][0]['id']['channelId']
        actual_name = response['items'][0]['snippet']['title']
        print(f"검색된 채널: {actual_name}")
        print(f"채널 ID: {channel_id}")
        return channel_id
    else:
        print("❌ 채널을 찾을 수 없습니다.")
        return None

def get_url(channel_name=None, query='레시피', max_results=10):
    
    youtube = build("youtube", "v3", developerKey=youtube_key)

    search_params = {
        "q": query,
        "part": "snippet",
        "type": "video",
        "maxResults": max_results,
        "order": "relevance"
    }
    
    if channel_name:
        channel_id = get_channel_id(channel_name)
        search_params["channelId"] = channel_id
        print(f"🎯 특정 채널({channel_id}) 내에서 검색합니다.")
    else:
        print("🌍 전 세계 유튜브 채널에서 검색합니다.")
    print()
    request = youtube.search().list(**search_params)

    response = request.execute()

    recipe_videos = []
    for item in response.get("items", []):
        video_title = item["snippet"]["title"]
        video_url = f"https://www.youtube.com/watch?v={item['id']['videoId']}"
        thumbnail_url = item["snippet"]["thumbnails"]["high"]["url"]
        recipe_videos.append({
            "channel_name": item["snippet"]["channelTitle"], 
            "title": video_title, 
            "url": video_url,
            "thumbnail": thumbnail_url
        })
    
    return recipe_videos