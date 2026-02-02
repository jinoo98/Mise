from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import Recipe, Ingredient
from .services import start_langgraph_workflow, get_url, get_channel_id
from .food_ingredient_calculation import run_analysis
from django.utils.safestring import mark_safe
import os
from django.conf import settings
import markdown
import traceback
import json
import re

def process_recipes_for_display(recipes):
    for r in recipes:
        # 1. 제목에서 마크다운 기호와 "음식명" 관련 텍스트 제거 (Regex 사용)
        if r.recipe_title:
            # ## 음식명: 혹은 ## 음식명 등 다양한 패턴 제거
            r.title_html = re.sub(r'^#*\s*음식명\s*[:]?\s*', '', r.recipe_title).strip()
        else:
            r.title_html = "제목 없음"
        
        # 2. 제목은 마크다운 변환 없이 그냥 깨끗한 텍스트로 사용  
    
        if r.ingredients:
            text = r.ingredients.replace('- 주재료:','').replace('- 부재료:','').replace('- 조미료:','')
            # r.ingredients_html = mark_safe('markdown.markdown(r.ingredients.strip(), extensions=['extra'])')
            r.ingredients_html = mark_safe(markdown.markdown(text.strip(), extensions=['extra']))
        else:
            r.ingredients_html = ""
            
        if r.recipe:
            r.recipe_html = mark_safe(markdown.markdown(r.recipe.strip(), extensions=['extra']))
        else:
            r.recipe_html = ""

def index(request):
    # 메인 페이지는 저장된 레시피 목록만 보여줌
    recent_recipes = Recipe.objects.all().order_by('-created_at')[:6]

    process_recipes_for_display(recent_recipes)
    return render(request, 'main/index.html', {'recent_recipes': recent_recipes})


def price(request):
    """단가 계산 페이지"""
    # 1. 모든 레시피와 연결된 재료들을 가져옵니다.
    recipes = Recipe.objects.prefetch_related('ingredient_items').all()
    
    recipes_list = []
    for r in recipes:
        # 2. 해당 레시피에 달린 재료들을 자바스크립트용 리스트로 변환
        ing_list = []
        for ing in r.ingredient_items.all():
            try:
                # TextField인 price를 숫자로 변환 (계산을 위함)
                # '원', ',' 등을 제거하고 숫자만 추출
                price_val = int(''.join(filter(str.isdigit, str(ing.price)))) if ing.price else 0
            except (ValueError, TypeError):
                price_val = 0
                
            ing_list.append({
                'name': ing.ingredients,  # 모델의 ingredients 필드 (재료명)
                'quantity': ing.quantity if ing.quantity else '1회분',
                'price': price_val,
                'url': ing.url
            })
            
        # 3. 전체 레시피 데이터를 구조화 (재료가 있는 경우만 추가)
        if ing_list:
            # Clean name (remove markdown headers)
            r_name = r.recipe_title if r.recipe_title else r.title
            r_name = re.sub(r'^#*\s*음식명\s*[:]?\s*', '', r_name).replace('##', '').strip()
            
            recipes_list.append({
                'name': r_name,
                'baseServings': 2,           # 기본 기준 인원수
                'ingredients': ing_list      # 재료 리스트
            })
    
    # 4. JSON 문자열로 변환은 템플릿의 json_script 필터에서 수행하므로 리스트 그대로 전달합니다.
    print(recipes_list)
    
    return render(request, 'main/price.html', {'recipes_data': recipes_list})

def matching(request):
    """재료 매칭 페이지"""
    recipes = Recipe.objects.prefetch_related('ingredient_items').all()
    
    recipes_list = []
    for r in recipes:
        ing_list = [{'name': ing.ingredients, 'url': ing.url} for ing in r.ingredient_items.all() if ing.ingredients]
        
        if ing_list:
            r_name = r.recipe_title if r.recipe_title else r.title
            r_name = re.sub(r'^#*\s*음식명\s*[:]?\s*', '', r_name).replace('##', '').strip()
            
            recipes_list.append({
                'id': r.id,
                'name': r_name,
                'ingredients': ing_list,
                'youtuber': r.youtuber if r.youtuber else "Unknown",
                'description': r.title, 
                'youtube_url': r.youtube_url if r.youtube_url else "",
                'thumbnail': r.thumbnail if r.thumbnail else "",
                'full_recipe': r.recipe if r.recipe else "상세 레시피 정보가 없습니다.",
                'time': r.cooking_time if r.cooking_time else "N/A",
                'difficulty': r.cooking_difficulty if r.cooking_difficulty else "N/A",
                'information': r.information if r.information else "",
                'tip': r.tip if r.tip else ""
            })
            
    return render(request, 'main/matching.html', {'recipes_data': recipes_list})

def search(request):
    search_results = []
    
    if request.method == "POST":
        # 1. 검색 요청 처리
        if 'search_query' in request.POST:
            query = request.POST.get('search_query')
            search_type = request.POST.get('search_type', 'channel') # 기본값은 채널 검색
            
            if query:
                try:
                    if search_type == 'channel':
                        # 채널 검색 모드
                        channel_id = get_channel_id(query)
                        if channel_id:
                            print(f"채널 발견: {channel_id}, 채널 내 검색 시도")
                            search_results = get_url(channel_name=query, query='레시피', max_results=10)
                        else:
                            print("채널을 찾을 수 없습니다.")
                            search_results = []
                    else:
                        # 요리명(키워드) 검색 모드
                        print("일반 키워드 검색 시도")
                        search_results = get_url(query=query, max_results=5)

                except Exception as e:
                    print(f"Search Error: {e}")
                    search_results = []
    
    recent_recipes = Recipe.objects.all().order_by('-created_at')[:6]
    process_recipes_for_display(recent_recipes)
    
    return render(request, 'main/index.html', {
        'recent_recipes': recent_recipes,
        'search_results': search_results
    })

def extract(request):
    """레시피 추출 및 저장 담당"""
    if request.method == "POST":
        url = request.POST.get('youtube_url')
        print(f"Extract Request URL: {url}")
        
        if url:
            try:
                app = start_langgraph_workflow()
                initial_state = {
                    "url": [url],
                    "youtuber": [],
                    "title": [],
                    "transcript": [],
                    "recipe": [],
                    "tip": [],
                    "is_satisfactory": True,
                    "prompt": ""
                }
                
                print("Running LangGraph workflow...")
                result = app.invoke(initial_state)
                print("Workflow finished.")

                if result.get('is_satisfactory'):
                    # POST로 전달된 메타데이터 우선 사용
                    title = request.POST.get('video_title') or (result['title'][0] if result['title'] else "제목 없음")
                    youtuber = request.POST.get('channel_name') or (result['youtuber'][0] if result['youtuber'] else "Unknown")
                    thumbnail = request.POST.get('thumbnail') or ""
                    
                    full_recipe = result['recipe'][0] if result['recipe'] else ""
                    full_tip = result['tip'][0] if result['tip'] else ""
                    transcript = result['transcript'][0] if result['transcript'] else ""

                    # Parse Ingredients, Steps, Cooking Time, and Difficulty
                    ingredients_content = ""
                    recipe_steps_content = ""
                    cooking_time = "시간 정보 없음"
                    cooking_difficulty = "난이도 정보 없음"
                    recipe_title_extracted = "요리명 없음"

                    # 1. Title Extraction
                    lines = full_recipe.strip().split('\n')
                    for line in lines:
                        if line.strip().startswith('## 음식명'):
                             recipe_title_extracted = line
                             break

                    # 2. Section Parsing using regex split (more robust)
                    # Split by known headers
                    import re
                    
                    # Initialize default contents
                    recipe_steps_content = full_recipe # Fallback
                    
                    # Extract sections if they exist
                    if "### 재료" in full_recipe:
                         parts = full_recipe.split("### 재료")
                         # Everything before ingredients (after title) could be ignored or kept
                         remaining = parts[1]
                         
                         if "### 과정" in remaining:
                             ing_parts = remaining.split("### 과정")
                             ingredients_content = "### 재료\n" + ing_parts[0].strip()
                             remaining = ing_parts[1]
                             
                             # Extract Process, Time, Difficulty from remaining
                             
                             # Check for Cooking Time
                             if "### 조리 시간" in remaining: # Try '조리 시간' with space
                                 step_parts = remaining.split("### 조리 시간")
                                 recipe_steps_content = "### 과정\n" + step_parts[0].strip()
                                 remaining = step_parts[1]
                             elif "### 조리시간" in remaining: # Try '조리시간' without space
                                 step_parts = remaining.split("### 조리시간")
                                 recipe_steps_content = "### 과정\n" + step_parts[0].strip()
                                 remaining = step_parts[1]
                             else:
                                 recipe_steps_content = "### 과정\n" + remaining.strip()
                                 remaining = "" # No time/difficulty found
                             
                             # If we have time/difficulty part, parse it
                             if remaining:
                                 # Try to find difficulty
                                 if "### 난이도" in remaining:
                                     time_parts = remaining.split("### 난이도")
                                     time_val = time_parts[0].replace(":","").strip()
                                     if time_val: cooking_time = time_val
                                     
                                     diff_val = time_parts[1].replace(":","").strip()
                                     if diff_val: cooking_difficulty = diff_val
                                 else:
                                     # Only time exists? or something else
                                     time_val = remaining.replace(":","").strip()
                                     if time_val: cooking_time = time_val

                    # Parse Information and Tip
                    information_content = ""
                    tip_content = full_tip
                    
                    if "### 음식 정보:" in full_tip and "### 요리 팁 요약" in full_tip:
                        tip_parts = full_tip.split("### 요리 팁 요약")
                        information_content = tip_parts[0].strip()
                        tip_content = "### 요리 팁 요약\n" + tip_parts[1].strip()
                    else:
                        if "### 음식 정보:" in full_tip:
                             information_content = full_tip
                    
                    input_text = recipe_title_extracted + '\n\n' + ingredients_content
                    print("Running analysis...")
                    recipes_calculated, food_recipes, total_cost = run_analysis(input_text)
                    print("Analysis completed.")
                    print(recipes_calculated)

                    new_recipe = Recipe.objects.create(
                        title=title,
                        youtuber=youtuber,
                        youtube_url=url,
                        thumbnail=thumbnail,
                        transcript=transcript,
                        recipe_title=recipe_title_extracted,
                        ingredients=ingredients_content,
                        recipe=recipe_steps_content,
                        cooking_time=cooking_time,
                        cooking_difficulty=cooking_difficulty,
                        information=information_content,
                        tip=tip_content,
                        cost_estimate=total_cost * 2  # 최종 가격은 2배로 계산
                    )

                    for recipe in recipes_calculated:
                        if recipe is not None:
                            Ingredient.objects.create(
                                name=new_recipe,
                                recipe_title=recipe_title_extracted,
                                ingredients=recipe['name'],
                                quantity = recipe['quantity'],
                                price=recipe['price'] * 2,  # 개별 재료 가격도 2배로 계산
                                url=recipe['link']
                            )   
                    print(f"Recipe saved: {recipe_title_extracted}")
                else:
                    print("Recipe extraction not satisfactory.")

                if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                    return JsonResponse({'status': 'success', 'message': '분석 완료'})
            
                return redirect('index') # 일반 요청일 경우 대비

            except Exception as e:
                if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                    return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
                traceback.print_exc()

    return redirect('index')