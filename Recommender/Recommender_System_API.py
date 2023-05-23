import operator
import math
from collections import defaultdict
from random import *
from scipy.spatial import distance as dis
import numpy as np
import pandas as pd
import json
from flask import Flask, jsonify, request, Response

"""
Section 1:
Content-based Recommender
"""
# Method used to read in the Disease_Symptom_Matrix and Doctor_Disease_Matrix


def load_Matrix():
    # 1. read in the Disease_Symptom_Matrix and translate it into a matrix
    Disease_Symptoms_Table = pd.read_csv(
        'TF_IDF_Matrix/TFIDF_Symptoms.csv', encoding='gbk')
    Disease_Symptoms_Table.set_index('Disease', inplace=True)

    # 2. read in the Doctor_Disease_Matrix and translate it into a matrix
    Doctor_Diseases_Table = pd.read_csv(
        'TF_IDF_Matrix/TFIDF_Diseases.csv', encoding='gbk')
    return Disease_Symptoms_Table, Doctor_Diseases_Table


# Sort the similarity value in the last row(User) to get the top-N recommended doctors
def top_N(n, similarity_Matrix):
    index_User = similarity_Matrix.shape[0]
    user_Sim = similarity_Matrix.iloc[index_User -
                                      1, :].sort_values(ascending=False)
    top_n_docs = user_Sim.iloc[:n, ]
    top_n_docs = top_n_docs.rename('scores')
    return pd.DataFrame(top_n_docs)


# Add the user-TF-IDF list at the end of the table
def add_UserFeatures(origin_table, User_features):
    origin_table.loc['User_Disease', :] = User_features
    return origin_table


# Calculate the similarity matrix based on TF_IDF_Matrix
def similarity_cal(origin_table):
    origin_matrix = np.matrix(origin_table)
    number_items = origin_table.shape[0]
    # 1. create a new matrix with n*n size (n = number_items)
    Similarity_matrix = np.zeros((number_items, number_items))
    # 2. calculate the similarity value by cosine() function
    for i in range(number_items):
        if i != number_items-1:
            Similarity_matrix[number_items-1][i] = (1 - dis.cosine(
                origin_matrix.getA()[number_items-1], origin_matrix.getA()[i]))
    simiarity_whole = pd.DataFrame(
        Similarity_matrix, index=origin_table.index, columns=origin_table.index)
    return simiarity_whole


def Content_based_Recommender(symptom_list):
    # get a symptom list
    #     symptom_list = ['disturbance of consciousness', 'out of breath', 'respiratory failure']
    # load the TF-IDF into dataframes
    Disease_Symptoms_Table, Doctor_Diseases_Table = load_Matrix()
    # 1. Calculate the recommended diseases on the symptoms
    # 1.1 Translate the symptom list into a list in the format of TF-IDF matrix of Disease_to_Symptoms
    new_Symptom_list = []
    index_final, column_final = Disease_Symptoms_Table.shape
    for index_i in range(column_final):
        if Disease_Symptoms_Table.columns[index_i] in symptom_list:
            new_Symptom_list.append(1)
        else:
            new_Symptom_list.append(0)
    # 1.2 Add the new_Symptom_list at the end of the Disease_Symptoms_Table
    Disease_Symptoms_Table2 = add_UserFeatures(
        Disease_Symptoms_Table, new_Symptom_list)
    # 1.3 Calculate the similarity matrix based on the new matrix
    similarity_Disease_Symptom = similarity_cal(Disease_Symptoms_Table2)
    # 1.4 Get the top 20 recommended diseases
    top_Diseases = top_N(20, similarity_Disease_Symptom)
    print(top_Diseases)
    # 2. Calculate the recommended doctors based on the diseases' scores
    # 2.1 Translate the disease list into a list in the format of TF-IDF matrix of Doctor_to_Diseases
    new_Disease_list = []
    index_final, column_final = Doctor_Diseases_Table.shape
    for index_i in range(column_final):
        if Doctor_Diseases_Table.columns[index_i] in top_Diseases.index.tolist():
            # print(index_i)
            # print(top_Diseases.loc[Doctor_Diseases_Table.columns[index_i], 'scores'])
            new_Disease_list.append(
                float(top_Diseases.loc[Doctor_Diseases_Table.columns[index_i], 'scores']))
        else:
            new_Disease_list.append(0)
    # 2.2 Add the new_Disease_list at the end of the Doctor_Diseases_Table
    Doctor_Diseases_Table2 = add_UserFeatures(
        Doctor_Diseases_Table, new_Disease_list)
    # 2.3 Calculate the similarity matrix based on the new matrix
    similarity_Doctor_Disease = similarity_cal(Doctor_Diseases_Table2)
    # 2.4 Get the top 40 recommended diseases
    top_40_Doctors = top_N(40, similarity_Doctor_Disease)
    return top_40_Doctors

"""
Section 2:
Update the matrix in the Content-based model
"""
# calculate the TF values of a doctor(i)'s features


def TF_cal(features, doc_frequency):
    # calculate the TF value of each word
    word_tfs = {}
    for i in features:
        word_tfs[i] = doc_frequency[i] / sum(doc_frequency.values())
    return word_tfs


# calculate the IDF values of a doctor(i)'s features
def IDF_cal(features, list_words):
    # get the doctor number
    doc_number = len(list_words)

    word_idfs = {}
    word_doc = defaultdict(int)
    for i in features:
        for j in list_words:
            if i in j:
                word_doc[i] += 1
    for i in features:
        word_idfs[i] = math.log(doc_number / word_doc[i] + 1)
    return word_idfs


# calculate the TF-IDF value of a doctor(i)'s features
def TF_IDF_cal(features, list_words):
    # calculate the frequency of words
    doc_frequency = defaultdict(int)
    for word in list_words:
        for i in word:
            doc_frequency[i] += 1

    word_tfs = TF_cal(features, doc_frequency)
    word_idfs = IDF_cal(features, list_words)

    word_tfidfs = {}
    for i in features:
        word_tfidfs[i] = word_tfs[i] * word_idfs[i]

    return word_tfidfs


# TF-IDF algorithm
def feature_select(list_words):
    doc_Matrix = []
    doc_tfidfs = {}
    for features in list_words:
        doc_tfidfs = TF_IDF_cal(features, list_words)
        doc_Matrix.append(doc_tfidfs)

    return doc_Matrix


# Method used to read in the doctor_to_diease table from file into a dataframe
def load_Doctor_DataSet(update_doctorArray):
    doctor_to_diseases = pd.read_csv('Update_Matrix/doctor_to_diseases.csv')
    # If the largest updated ID is bigger than the former stored largest ID, create new vectors for them.
    print(update_doctorArray[0]['id'], doctor_to_diseases.shape[0])
    if update_doctorArray[0]['id'] >= doctor_to_diseases.shape[0]:
        # print("--------------------------------------------------------------------------------")
        # id_difference = update_doctorArray[0]['id'] - doctor_to_diseases2.shape[0] + 1
        ID_max = update_doctorArray[0]['id']
        former_ID_max = doctor_to_diseases.shape[0]-1
        # print(ID_max, former_ID_max)
        # define the new vectors to be added  is null
        new_arr = []
        for i in range(7):
            new_arr.append('nan')

        while ID_max > former_ID_max:
            doctor_to_diseases.loc[len(doctor_to_diseases.index)] = new_arr
            former_ID_max+=1
            # print(new_arr)
            # print(doctor_to_diseases.shape[0])
    # update the doctors' tags with the update_doctorArray
    for i in range(len(update_doctorArray)):
        new_dis_arr = []
        for j in range(7):
            if j < len(update_doctorArray[i]['tagsArr']):
                new_dis_arr.append(update_doctorArray[i]['tagsArr'][j])
            else:
                new_dis_arr.append('nan')
        doctor_to_diseases.loc[update_doctorArray[i]['id'], :] = new_dis_arr
    # Write the updated doctor-to-disease dataset back
    doctor_to_diseases.to_csv('Update_Matrix/doctor_to_diseases.csv', index=False)
    # convert the dataframe to list
    temp_dataset = doctor_to_diseases.values.tolist()
    dataset = []
    for list in temp_dataset:
        list = [i for i in list if str(i) != 'nan']
        dataset.append(list)

    return dataset


# Method used to read in the disease_to_symptom table from file into a dataframe
def load_Symptom_DataSet():
    disease_to_symptoms = pd.read_csv('Update_Matrix/disease_to_symptoms.csv')
    disease_to_symptoms2 = disease_to_symptoms.drop(['Disease'], axis=1)
    temp_dataset = disease_to_symptoms2.values.tolist()
    dataset = []
    for list in temp_dataset:
        list = [str(i).lower() for i in list if str(i) != 'nan']
        # print(list)
        dataset.append(list)

    return dataset, disease_to_symptoms['Disease']


# Method used to get the list of the diseases
def get_disease_list(doctor_diseases):
    disease_dic = defaultdict(int)
    for list in doctor_diseases:
        for i in list:
            disease_dic[i] += 1

    return_disease_list = []
    for i in disease_dic.items():
        return_disease_list.append(i[0])
    return return_disease_list


# Method used to get the list of the symptoms
def get_symptom_list(disease_symptom):
    symptom_dic = defaultdict(int)
    for list in disease_symptom:
        for i in list:
            symptom_dic[i] += 1

    return_symptom_list = []
    for i in symptom_dic.items():
        return_symptom_list.append(i[0])
    return return_symptom_list


def update_matrix(update_doctorArray):
    #     1. Process on the doctor_disease data
    doctor_diseases = load_Doctor_DataSet(update_doctorArray)  # load doctor-disease data
    disease_list = get_disease_list(doctor_diseases)  # get the whole disease list
    features = feature_select(doctor_diseases)  # get all TF-IDF values

    # Create a matrix to store the TF-IDF values
    # step1. Create a matrix with all 0
    Doctor_Diseases_Matrix = np.zeros((len(doctor_diseases), len(disease_list)))
    # step2. Change it into Dataframe
    Doctor_Diseases_Table = pd.DataFrame(Doctor_Diseases_Matrix, columns=disease_list)
    index_i = 0
    for i in features:
        for index_j in range(len(disease_list)):
            if Doctor_Diseases_Table.columns[index_j] in i:
                Doctor_Diseases_Table.iloc[index_i,index_j] = i[Doctor_Diseases_Table.columns[index_j]]
        index_i += 1
    Doctor_Diseases_Table.fillna(0)
    # 3. Write it into a file
    Doctor_Diseases_Table.to_csv('TF_IDF_Matrix/TFIDF_Diseases.csv', index=False)

    #     2. Process on the disease_symptom data
    disease_symptom, diseases_column = load_Symptom_DataSet()  # load data
    symptom_list = get_symptom_list(disease_symptom)  # get the whole symptom list
    features = feature_select(disease_symptom)  # get all TF-IDF values

    # Create a matrix to store the TF-IDF values
    # step1. Create a matrix with all 0
    Disease_Symptoms_Matrix = np.zeros((len(disease_symptom), len(symptom_list)))
    # step2. Change it into Dataframe
    Disease_Symptoms_Table = pd.DataFrame(
        Disease_Symptoms_Matrix, columns=symptom_list)
    index_i = 0
    for i in features:
        for index_j in range(len(symptom_list)):
            if Disease_Symptoms_Table.columns[index_j] in i:
                Disease_Symptoms_Table.iloc[index_i,
                                            index_j] = i[Disease_Symptoms_Table.columns[index_j]]
        index_i += 1
    Disease_Symptoms_Table.fillna(0)
    Disease_Symptoms_Table.insert(0, "Disease", diseases_column)
    # print(Disease_Symptoms_Table)
    # 3. Write it into a file
    Disease_Symptoms_Table.to_csv('TF_IDF_Matrix/TFIDF_Symptoms.csv', index=False)

"""
Section 3:
Collaborative filtering Recommender
"""
# Calculate the similarity matrix based on TF_IDF_Matrix
def similarity_cal_doctors(origin_table, doctor_list):
    origin_matrix = np.matrix(origin_table)
    number_items = origin_table.shape[0]
    # 1. create a new matrix with n*n size (n = number_items)
    Similarity_matrix = np.zeros((number_items, number_items))
    # 2. calculate the similarity value by cosine() function
    for i in range(number_items):
        for j in doctor_list:
            if i != j:
                Similarity_matrix[j][i] = (1 - dis.cosine(origin_matrix.getA()[j], origin_matrix.getA()[i]))
    simiarity_whole = pd.DataFrame(Similarity_matrix, index=origin_table.index, columns=origin_table.index)
    return simiarity_whole

# Load the matrix of the scores that patient-to-doctors
def load_score_matrix():
    # read in the Doctor-Patient and translate it into a matrix
    Score_Table = pd.read_csv('Doctor-Patient.csv', encoding='gbk')
    return Score_Table

# Sort the similarity value in the i row to get the top-N similar doctors
def top_K_withIndex(n, index, similarity_Matrix):
    user_Sim = similarity_Matrix.iloc[index, :].sort_values(ascending=False)
    top_n_docs = user_Sim.iloc[:n, ]
    top_n_docs = top_n_docs.rename('scores')
    return pd.DataFrame(top_n_docs)

# Count the average of a dataframe
def count_average(index, score_matrix):
    doctor_scores = score_matrix.iloc[index, :].tolist()
    return sum(doctor_scores) / len(doctor_scores)

# Define the equation that predict the score that user U will give to doctor X
def score_predict(user_index, doc_index, neighbor_docs, score_matrix):
    aver_X = count_average(doc_index, score_matrix)
    similarity_gap = []
    similarity_absolute = []
    for i in range(neighbor_docs.shape[0]):
        # 1.1 calculate the similarity multiple by the score gap
        score_gap = score_matrix.iloc[doc_index ,user_index] - count_average(neighbor_docs.index[i], score_matrix)
        score_simi = neighbor_docs.iloc[i,0] * score_gap
        # 1.2 add the value into list
        similarity_gap.append(score_simi)
        
        # 2.1 calculate the absolute value of similarity
        simi_absolute = math.fabs(neighbor_docs.iloc[i])
        # 2.2 add the value into list
        similarity_absolute.append(simi_absolute)
    sum_similarity_gap = sum(similarity_gap)
    sum_similarity_absolute = sum(similarity_absolute)
    
    simi_ratio = sum_similarity_gap / sum_similarity_absolute
    return aver_X + simi_ratio

def Collaborative_filtering(pre_user_id, recommended_doctors):
    recommended_doctors_dict = recommended_doctors.to_dict('split')['index']
    score_matrix = load_score_matrix()
    Disease_Symptoms_Table, Doctor_Diseases_Table = load_Matrix()
    # Calculate the similarity between the recommended doctor and others
    similarity_Doctors = similarity_cal_doctors(Doctor_Diseases_Table, recommended_doctors_dict)
    neighbor_K = 40
    new_rec_docs = recommended_doctors.copy()
    for i in range(recommended_doctors.shape[0]):
        # 1. get the nearest K neighbors of doctor_i
        top_K_Neighbors = top_K_withIndex(neighbor_K, recommended_doctors.index[i], similarity_Doctors)
        # 2. calculate the predict score of user_i to doctor_i
        score_i = score_predict(pre_user_id, recommended_doctors.index[i], top_K_Neighbors, score_matrix)
        # 3. store the predict scores with the doctor_id into the dataframe
        new_rec_docs.iloc[i,0] = score_i

    new_rec_docs = new_rec_docs.iloc[:,0].sort_values(ascending=False)
    new_rec_docs = new_rec_docs.rename('scores')
    return pd.DataFrame(new_rec_docs)

"""
Section 4:
Hybrid Recommender
"""
# Method calculate the recommendation values of the mixed results based on two weight
def hybrid_cal(recommended_doctors_1, recommended_doctors_2, w1, w2):
    new_recommendations = recommended_doctors_1.copy()
    for i in range(recommended_doctors_1.shape[0]):
        for j in range(recommended_doctors_2.shape[0]):
            if recommended_doctors_1.index[i] == recommended_doctors_2.index[j]:
                new_recommendations.iloc[i,0] = recommended_doctors_1.iloc[i,0] * w1 + recommended_doctors_2.iloc[j,0] * w2

    new_recommendations = new_recommendations.iloc[:,0].sort_values(ascending=False)
    new_recommendations = new_recommendations.rename('scores')
    return pd.DataFrame(new_recommendations)

def Hybrid_recommender(pre_user_id, symptom_list):
    # 1. Apply the Content-based recommender model
    CB_recommended_doctors = Content_based_Recommender(symptom_list)
    # print(CB_recommended_doctors)
    # 2. Apply the Collaborative filtering model based on the results from CB model
    CF_recommended_doctors = Collaborative_filtering(pre_user_id, CB_recommended_doctors)
    # print(CF_recommended_doctors)
    # 3. Mix the recommendations from two models with the weight weight_1 and weight_2 respectively.
    weight_1 = 1
    weight_2 = 0
    recommended_doctors = hybrid_cal(CB_recommended_doctors, CF_recommended_doctors, weight_1, weight_2)
    return recommended_doctors

# Create a service
app = Flask(__name__)

@app.route('/Recommender_System', methods=['POST'])
def recommender_system():
    data = request.get_data()
    json_Data = json.loads(data)
    # print(json_Data)
    user_id = json_Data['userid']-2000
    symptom_result = json_Data['symptom']
    # for i in range(len(json_Data)):
    #     symptom_result.append(json_Data[i]['symptom'])

    # print(user_id, symptom_result)
    try:
        recommended_doctors = Hybrid_recommender(user_id, symptom_result)
    except:
        # print("OK")
        errorData = {
            'message': 'error',
        }
        response_error = json.dumps(errorData)
        return response_error
    else:
        recommended_doctors_dict = recommended_doctors.to_dict('split')['index']
            # print(recommended_doctors_dict)
        response_format = {"ids": recommended_doctors_dict}
        # print(response_format)
        response = json.dumps(response_format)
        return response


@app.route('/update_TFIDF_matrix', methods=['POST'])
def update_TFIDF():

    data = request.get_data()
    json_Data = json.loads(data)

    update_doctorArray = json_Data['doctorArray']
    print(json_Data)
    try:
        update_matrix(update_doctorArray)
    except:
        errorData = {
            'message': 'error',
        }
        response_error = json.dumps(errorData)
        return response_error
    else:
        finishData = {
            'message': 'success',
        }
        response = json.dumps(finishData)
        return response


if __name__ == '__main__':
    # app.run()
    app.run(host='127.0.0.1', port=8848, debug=True)
