import cv2 as cv
import numpy as np
from multiprocessing import Pool
import time
import sys
import random
import string
import os

nprocs = 12  ## process sayisi

img_gray = cv.imread(sys.argv[1], cv.IMREAD_GRAYSCALE)
img_rgb = cv.imread(sys.argv[1], cv.IMREAD_COLOR)

resize_percentage = 100
max_dist = 150
##--------------------
img_gray = cv.resize(img_gray, (
    int(img_gray.shape[1] * resize_percentage / 100),
    int(img_gray.shape[0] * resize_percentage / 100)))
img_rgb = cv.resize(img_rgb, (
    int(img_rgb.shape[1] * resize_percentage / 100), int(img_rgb.shape[0] * resize_percentage / 100)))

sift = cv.xfeatures2d.SIFT_create()
keypoints_sift, descriptors = sift.detectAndCompute(img_gray, None)
img = cv.drawKeypoints(img_rgb, keypoints_sift, None)
# cv.imshow(" All Keypoints ", img)


def compare_keypoint(descriptor1, descriptor2):
    return np.linalg.norm(descriptor1 - descriptor2)


def apply_sift(in_vector):
    out_point_list = []
    for index_dis in in_vector:  # dist = numpy.linalg.norm(a-b)
        for index_ic in range(index_dis + 1, len(keypoints_sift)):
            point1_x = int(round(keypoints_sift[index_dis].pt[0]))
            point1_y = int(round(keypoints_sift[index_dis].pt[1]))
            point2_x = int(round(keypoints_sift[index_ic].pt[0]))
            point2_y = int(round(keypoints_sift[index_ic].pt[1]))
            if point1_x == point2_x & point1_y == point2_y:
                # print("benzer keypoints")
                continue

            dist = compare_keypoint(descriptors[index_dis], descriptors[index_ic])

            if dist < max_dist:
                out_point_list.append([round(keypoints_sift[index_dis].pt[0]), round(keypoints_sift[index_dis].pt[1]),
                                       round(keypoints_sift[index_ic].pt[0]), round(keypoints_sift[index_ic].pt[1])])

    if out_point_list:
        return out_point_list


def draw(matched_pts, output_file_path):
    for points in matched_pts:
        if points == None:
            continue
        for in_points in points:
            cv.circle(img_rgb, (in_points[0], in_points[1]),
                      4,
                      (0, 0, 255),
                      -1)  # eslesen objeyi isaretlemek icin

            cv.circle(img_rgb, (in_points[2], in_points[3]),
                      4,
                      (255, 0, 0),
                      -1)  # eslesen objeyi isaretlemek icin

            img_line = cv.line(img_rgb,
                               (in_points[0], in_points[1]),
                               (in_points[2], in_points[3]),
                               (0, 255, 0), 1)
    # cv.imshow("Image", img_rgb)
    cv.imwrite(output_file_path, img_rgb)


def randomString(stringLength=4):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(stringLength))
### -------------------


if __name__ == '__main__':
    pool = Pool(processes=nprocs)

    time1 = time.time()

    matched_pts = pool.map(apply_sift, np.array_split(range(len(descriptors)), nprocs))

    time2 = time.time()

    # print('{:.3f} ms'.format((time2 - time1) * 1000.0))
    pool.close()

    output_file_name = randomString() + '.jpg'
    output_file_path = os.path.join(sys.argv[2], output_file_name)
    draw(matched_pts, output_file_path)

    cv.destroyAllWindows()
    print(output_file_name, end='')
