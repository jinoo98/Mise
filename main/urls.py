# main/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),               # 메인 화면
    path('search/', views.search, name='search_recipe'), # 검색 기능
    path('extract/', views.extract, name='extract'), # 추출 기능
    path('price/', views.price, name='price'), # 단가 계산 페이지
    path('matching/', views.matching, name='matching'), # 재료 매칭 페이지
]