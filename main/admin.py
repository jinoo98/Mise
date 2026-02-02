# main/admin.py
from django.contrib import admin
from .models import Recipe, Ingredient  # 우리가 만든 Recipe 모델을 가져옵니다.

# 어드민 페이지에 Recipe를 등록합니다.
@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('clean_title', 'youtuber', 'created_at') # 목록에 보여줄 항목들
    search_fields = ('clean_title', 'recipe') # 검색창에서 검색할 필
    
    # 전처리 기능을 담당하는 함수 생성
    @admin.display(description='요리명') # 관리자 페이지 표 상단에 표시될 이름
    def clean_title(self, obj):
        if obj.recipe_title:
            # ##, 요리명:, # 등을 싹 제거하고 앞뒤 공백을 없앱니다.
            return obj.recipe_title.replace('##', '').replace('음식명:', '').replace('#', '').strip()
        return "제목 없음"

@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('clean_title', 'ingredients', 'price', 'url') # 목록에 보여줄 항목들
    search_fields = ('clean_title', 'ingredients') # 검색창에서 검색할 필드

    # 전처리 기능을 담당하는 함수 생성
    @admin.display(description='요리명') # 관리자 페이지 표 상단에 표시될 이름
    def clean_title(self, obj):
        if obj.recipe_title:
            # ##, 요리명:, # 등을 싹 제거하고 앞뒤 공백을 없앱니다.
            return obj.recipe_title.replace('##', '').replace('음식명:', '').replace('#', '').strip()
        return "제목 없음"