#!/usr/bin/env python
# coding: utf-8

from collections import defaultdict
import math
import operator

# calculate the TF values of a doctor(i)'s features
def TF_cal(features, doc_frequency):
    #calculate the TF value of each word
    word_tfs={}
    for i in features:
        word_tfs[i]=doc_frequency[i]/sum(doc_frequency.values())
    return word_tfs

# calculate the IDF values of a doctor(i)'s features
def IDF_cal(features, list_words):
    #get the doctor number
    doc_number=len(list_words)
    
    word_idfs={}
    word_doc=defaultdict(int)
    for i in features:
        for j in list_words:
            if i in j:
                word_doc[i]+=1
    for i in features:
        word_idfs[i]=math.log(doc_number/word_doc[i]+1)
    return word_idfs

# calculate the TF-IDF value of a doctor(i)'s features
def TF_IDF_cal(features,list_words):
    #calculate the frequency of words
    doc_frequency=defaultdict(int)
    for word in list_words:
        for i in word:
            doc_frequency[i]+=1
    
    word_tfs=TF_cal(features, doc_frequency)
    word_idfs=IDF_cal(features, list_words)
    
    word_tfidfs={}
    for i in features:
        word_tfidfs[i]=word_tfs[i]*word_idfs[i]
    
    return word_tfidfs

# TF-IDF algorithm
def feature_select(list_words):
    
    doc_Matrix=[]
    doc_tfidfs={}
    for features in list_words:
        doc_tfidfs=TF_IDF_cal(features,list_words)
        doc_Matrix.append(doc_tfidfs)
        
    return doc_Matrix