from django.db import models

class Recipe(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100) # 유튜브 제목
    youtuber = models.CharField(max_length=100) # 유튜버명
    youtube_url = models.URLField()          # 원본 영상 주소
    thumbnail = models.URLField(null=True)   # 썸네일
    transcript = models.TextField()      # 영상 대본
    recipe_title = models.CharField(max_length=50) # 요리명
    ingredients = models.TextField()         # 재료
    recipe = models.TextField()               # 조리 과정
    cooking_time = models.TextField()    # 조리 시간
    cooking_difficulty = models.TextField()    # 조리 난이도
    information = models.TextField()          # 음식 정보
    tip = models.TextField()                  # 팁
    cost_estimate = models.IntegerField()    # 예상 비용 
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.recipe_title

class Ingredient(models.Model):
    id = models.AutoField(primary_key=True) # 재료 고유 id
    name = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredient_items') # 레시피 제목
    recipe_title = models.CharField(max_length=50) # 요리명
    ingredients =  models.TextField() # 재료명
    quantity = models.TextField() # 재료 수량
    price = models.TextField() # 재료 가격
    url = models.URLField() # 재료 구매 링크
    def __str__(self):
        # 관리자 페이지나 터미널에서 '레시피 제목'으로 보이게 설정
        return f"{self.name.recipe_title}의 재료"
    
