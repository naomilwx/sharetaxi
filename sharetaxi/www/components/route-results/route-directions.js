angular.module('st.routeDirections', [])
  .factory('directionsMock', function(){
    return {
      directions: {
        "geocoded_waypoints" : [
          {
            "geocoder_status" : "OK",
            "partial_match" : true,
            "place_id" : "ChIJ2QJCeFYa2jERa434wdYIjUg",
            "types" : [ "university", "point_of_interest", "establishment" ]
          },
          {
            "geocoder_status" : "OK",
            "place_id" : "ChIJb_EWhHoW2jERjnZZ_OKYEtk",
            "types" : [ "route" ]
          }
        ],
        "routes" : [
          {
            "bounds" : {
              "northeast" : {
                "lat" : 1.3936208,
                "lng" : 103.8789678
              },
              "southwest" : {
                "lat" : 1.2775255,
                "lng" : 103.7828593
              }
            },
            "copyrights" : "Map data ©2015 Google, Urban Redevelopment Authority",
            "legs" : [
              {
                "distance" : {
                  "text" : "24.3 km",
                  "value" : 24291
                },
                "duration" : {
                  "text" : "27 mins",
                  "value" : 1590
                },
                "end_address" : "Fernvale Link, Singapore",
                "end_location" : {
                  "lat" : 1.3936208,
                  "lng" : 103.8789678
                },
                "start_address" : "21 Lower Kent Ridge Rd, National University of Singapore, Singapore 119077",
                "start_location" : {
                  "lat" : 1.293515,
                  "lng" : 103.7850164
                },
                "steps" : [
                  {
                    "distance" : {
                      "text" : "0.4 km",
                      "value" : 438
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 67
                    },
                    "end_location" : {
                      "lat" : 1.2967792,
                      "lng" : 103.7829959
                    },
                    "html_instructions" : "Head \u003cb\u003enorth\u003c/b\u003e on \u003cb\u003eLower Kent Ridge Rd\u003c/b\u003e",
                    "polyline" : {
                      "points" : "os{FkomxRIBC@OBU@I?Y@O@O@c@LULgBfA}A`A[LUHe@Ti@VSLKHa@XUVMPOP[f@"
                    },
                    "start_location" : {
                      "lat" : 1.293515,
                      "lng" : 103.7850164
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "0.5 km",
                      "value" : 524
                    },
                    "duration" : {
                      "text" : "2 mins",
                      "value" : 92
                    },
                    "end_location" : {
                      "lat" : 1.2933528,
                      "lng" : 103.7852333
                    },
                    "html_instructions" : "At the roundabout, take the \u003cb\u003e2nd\u003c/b\u003e exit and stay on \u003cb\u003eLower Kent Ridge Rd\u003c/b\u003e",
                    "maneuver" : "roundabout-left",
                    "polyline" : {
                      "points" : "{g|FwbmxR?@@??@?@?@?@?@?@?@?@A??@?@A??@A??@A?A??@A?A?A?A?A?A?A?AAA??AA??AA??AA??A?AA??A?A?A?A?A?A@??A?A@??A@??A@??A@?@??Af@m@`@g@VUHGJIPMtCwA|DcC\\SPGHCLALAD?XAZ?JC@?JCVGNIPM"
                    },
                    "start_location" : {
                      "lat" : 1.2967792,
                      "lng" : 103.7829959
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "39 m",
                      "value" : 39
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 11
                    },
                    "end_location" : {
                      "lat" : 1.2936049,
                      "lng" : 103.7854737
                    },
                    "html_instructions" : "Turn \u003cb\u003eleft\u003c/b\u003e onto \u003cb\u003eSouth Buona Vista Rd\u003c/b\u003e",
                    "maneuver" : "turn-left",
                    "polyline" : {
                      "points" : "mr{FupmxR[YUU"
                    },
                    "start_location" : {
                      "lat" : 1.2933528,
                      "lng" : 103.7852333
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "0.2 km",
                      "value" : 153
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 14
                    },
                    "end_location" : {
                      "lat" : 1.2948972,
                      "lng" : 103.7858556
                    },
                    "html_instructions" : "Keep \u003cb\u003eright\u003c/b\u003e to continue on \u003cb\u003eBuona Vista Flyover\u003c/b\u003e",
                    "maneuver" : "keep-right",
                    "polyline" : {
                      "points" : "_t{FermxRQKMIMIOIWGMCc@GQCWCc@CG?SAQA"
                    },
                    "start_location" : {
                      "lat" : 1.2936049,
                      "lng" : 103.7854737
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "60 m",
                      "value" : 60
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 27
                    },
                    "end_location" : {
                      "lat" : 1.295361,
                      "lng" : 103.7860866
                    },
                    "html_instructions" : "Slight \u003cb\u003eright\u003c/b\u003e toward \u003cb\u003eAYE\u003c/b\u003e",
                    "maneuver" : "turn-slight-right",
                    "polyline" : {
                      "points" : "c|{FstmxRAACAA?IAOCMCKAIEGCCEIM"
                    },
                    "start_location" : {
                      "lat" : 1.2948972,
                      "lng" : 103.7858556
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "4.7 km",
                      "value" : 4687
                    },
                    "duration" : {
                      "text" : "4 mins",
                      "value" : 257
                    },
                    "end_location" : {
                      "lat" : 1.2789443,
                      "lng" : 103.8230134
                    },
                    "html_instructions" : "Turn \u003cb\u003eright\u003c/b\u003e to merge onto \u003cb\u003eAYE\u003c/b\u003e toward \u003cb\u003eKeppel Road\u003c/b\u003e\u003cdiv style=\"font-size:0.9em\"\u003ePartial toll road\u003c/div\u003e",
                    "polyline" : {
                      "points" : "__|FavmxRB_@ZGj@KrC]REHEFCNIbEaEb@Q|@wAhHmMb@w@zA{Cd@w@P[fBeCf@o@HMFGHKhAyAt@gAf@{@z@}AxD_I^s@n@mAb@w@fAeB`BsChCgEd@}@^q@Z{@ZaAVsAJk@Ho@?E?A?ABm@?C@URoGXaRZyLRuHVcFT{BXsBl@sDf@}AfAaDjA{BjDsGpCcF@A?ATc@@Ap@wAl@kA|@gBfAwCZ}BBSJoAD}@J_G@_@B]"
                    },
                    "start_location" : {
                      "lat" : 1.295361,
                      "lng" : 103.7860866
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "9.1 km",
                      "value" : 9110
                    },
                    "duration" : {
                      "text" : "8 mins",
                      "value" : 466
                    },
                    "end_location" : {
                      "lat" : 1.3353521,
                      "lng" : 103.862084
                    },
                    "html_instructions" : "Keep \u003cb\u003eright\u003c/b\u003e at the fork to continue on \u003cb\u003eCTE\u003c/b\u003e, follow signs for \u003cb\u003eAng Mo Kio\u003c/b\u003e\u003cdiv style=\"font-size:0.9em\"\u003ePartial toll road\u003c/div\u003e",
                    "maneuver" : "fork-right",
                    "polyline" : {
                      "points" : "kxxFy|txRBUJq@H[FY@IFS@G@A?CJi@HUFQPc@v@cBh@cARc@Zo@No@?ADWHg@BM?ABy@?W?OEi@Gk@Ok@Qi@Wg@W_@W[c@_@WSkBgAQKCCA?KIECCAi@]SQiA{@y@s@u@w@}@cAq@_Ag@}@aAiB_@w@GOEIAGKWiBuF_@kAg@kBGQEOEQ[iA[aASu@Qc@EG?AKSCEACOYCGEKYa@[_@_@[y@k@mAs@kAm@i@Ye@Yc@_@UU[]AACCAAMQS[EIQ]yCoGEKMUIMGKKOGKS[CCAACCm@{@KOMM?ASUQOQMsAk@KEUKg@Ug@U]S_@QqAy@q@c@EEECGEIE}C_BuB{@_A_@gA_@yB{@YKGC[ISCSC_AKe@?k@?gA@}DX_BLmAH_AFsCRoA@c@@wBBO?iABeCDY@G?E@A?mALm@J_@Lc@PA?IDC@GBMFEBEBGDGDKHg@l@ABq@p@MLaAlAs@z@q@|@iAvAo@n@]Ze@Z_@ROFa@RYL_@L]HWDm@Fw@Fy@Bo@Ac@A[Co@IIAu@S{@SSGaD_CGKIKs@cAaBoCiCqCgAkAy@w@k@o@SQa@YWUCACAQKA?AAGCGECAAAKCEAA?UIm@MoF}@yB]s@K}Ai@IEC?k@SCACAuAe@{@[c@WCA_@Sa@YcAw@IIKI[W]YuA{AcBiCcAyB}CmIuB_HaB{EYo@Qc@IQ?AACEIAAKQ?AAAAC?AA?IOAAS_@{BgEwAsBW[{AaBcDqC}@{@uDeDi@g@o@q@gMwMY[i@i@w@u@aAw@oAo@{@[y@Ys@Sw@Sk@Ic@KA?{@Gs@C]Ie@Cc@?Y?C?I?C?I?M?c@@E?S?C?Y@sA?}DBkCFi@@cAD_@@K?kBBgDF{@@"
                    },
                    "start_location" : {
                      "lat" : 1.2789443,
                      "lng" : 103.8230134
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "0.5 km",
                      "value" : 490
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 22
                    },
                    "end_location" : {
                      "lat" : 1.3397117,
                      "lng" : 103.861609
                    },
                    "html_instructions" : "Take the exit on the \u003cb\u003eright\u003c/b\u003e toward \u003cb\u003eCTE\u003c/b\u003e\u003cdiv style=\"font-size:0.9em\"\u003eToll road\u003c/div\u003e",
                    "maneuver" : "ramp-right",
                    "polyline" : {
                      "points" : "}xcG_q|xRcD?sBBaCD}ADqBLK@c@DG@SB}@Pe@Hw@NUD"
                    },
                    "start_location" : {
                      "lat" : 1.3353521,
                      "lng" : 103.862084
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "5.6 km",
                      "value" : 5625
                    },
                    "duration" : {
                      "text" : "4 mins",
                      "value" : 269
                    },
                    "end_location" : {
                      "lat" : 1.3883618,
                      "lng" : 103.8581016
                    },
                    "html_instructions" : "Continue onto \u003cb\u003eCTE\u003c/b\u003e\u003cdiv style=\"font-size:0.9em\"\u003ePartial toll road\u003c/div\u003e",
                    "polyline" : {
                      "points" : "etdGan|xRwBh@oHfBaFlAk@NKB?@KBA?G@ODKBA@E@IBoBd@A@KDyD~@gJ|BsAd@}@NeZ|HqAReDh@mAJwBFcDBC?cA?A?C?CAC?I?A?I?C?MAWAm@E{AMsBSoEaAw@OuHmByT{FmAUUE_EaAkCo@gD}@yDaAa@K]Gk@G]EUEOAa@Es@EuAGE?]@C?[@C?C?U@[B[Bg@Fa@Hy@Lq@P_D`AcMnEgBd@cAZwFhA_AJSBE@K@SBC@[BSBqDVkAH_ABgA@eA@oA?sBCaAA}LMmBC}AAU@qIJ_C@yIJcBB"
                    },
                    "start_location" : {
                      "lat" : 1.3397117,
                      "lng" : 103.861609
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "0.3 km",
                      "value" : 308
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 39
                    },
                    "end_location" : {
                      "lat" : 1.3910231,
                      "lng" : 103.8580595
                    },
                    "html_instructions" : "Take exit \u003cb\u003e15\u003c/b\u003e for \u003cb\u003eYio Chu Kang Rd\u003c/b\u003e",
                    "maneuver" : "ramp-left",
                    "polyline" : {
                      "points" : "gdnGcx{xR[LGBi@D_BNy@FsBPu@AUESCUEKEGCa@UCACCA?AA"
                    },
                    "start_location" : {
                      "lat" : 1.3883618,
                      "lng" : 103.8581016
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "1.2 km",
                      "value" : 1203
                    },
                    "duration" : {
                      "text" : "2 mins",
                      "value" : 106
                    },
                    "end_location" : {
                      "lat" : 1.3884572,
                      "lng" : 103.8683134
                    },
                    "html_instructions" : "Turn \u003cb\u003eright\u003c/b\u003e onto \u003cb\u003eYio Chu Kang Rd\u003c/b\u003e",
                    "maneuver" : "turn-right",
                    "polyline" : {
                      "points" : "{tnG{w{xRi@A@I@I@E?Ah@oDd@qC`@}BBIBYfBiK\\}At@sDpAmHX{AN{@dAcGP}@Hc@Nw@"
                    },
                    "start_location" : {
                      "lat" : 1.3910231,
                      "lng" : 103.8580595
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "23 m",
                      "value" : 23
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 2
                    },
                    "end_location" : {
                      "lat" : 1.3885724,
                      "lng" : 103.8684883
                    },
                    "html_instructions" : "Turn \u003cb\u003eleft\u003c/b\u003e toward \u003cb\u003eSengkang W Rd\u003c/b\u003e",
                    "maneuver" : "turn-left",
                    "polyline" : {
                      "points" : "{dnG}w}xRIKCEGQ"
                    },
                    "start_location" : {
                      "lat" : 1.3884572,
                      "lng" : 103.8683134
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "0.3 km",
                      "value" : 313
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 38
                    },
                    "end_location" : {
                      "lat" : 1.391263,
                      "lng" : 103.8690676
                    },
                    "html_instructions" : "Turn \u003cb\u003eleft\u003c/b\u003e onto \u003cb\u003eSengkang W Rd\u003c/b\u003e",
                    "maneuver" : "turn-left",
                    "polyline" : {
                      "points" : "qenGay}xROWCCCAIC_@I[GICa@M[Cq@GA?qCOu@Gk@AkAG"
                    },
                    "start_location" : {
                      "lat" : 1.3885724,
                      "lng" : 103.8684883
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "1.1 km",
                      "value" : 1126
                    },
                    "duration" : {
                      "text" : "3 mins",
                      "value" : 158
                    },
                    "end_location" : {
                      "lat" : 1.3919294,
                      "lng" : 103.8788555
                    },
                    "html_instructions" : "Turn \u003cb\u003eright\u003c/b\u003e onto \u003cb\u003eSengkang West Ave\u003c/b\u003e",
                    "maneuver" : "turn-right",
                    "polyline" : {
                      "points" : "kvnGu|}xRSA@[DqA@s@JwBBa@LcCBUDw@B{@N}CNkDVsFDsABu@@WCSAOE[E[Mk@qAiE{@qCK[Sq@]gA"
                    },
                    "start_location" : {
                      "lat" : 1.391263,
                      "lng" : 103.8690676
                    },
                    "travel_mode" : "DRIVING"
                  },
                  {
                    "distance" : {
                      "text" : "0.2 km",
                      "value" : 192
                    },
                    "duration" : {
                      "text" : "1 min",
                      "value" : 22
                    },
                    "end_location" : {
                      "lat" : 1.3936208,
                      "lng" : 103.8789678
                    },
                    "html_instructions" : "Turn \u003cb\u003eleft\u003c/b\u003e onto \u003cb\u003eFernvale Link\u003c/b\u003e",
                    "maneuver" : "turn-left",
                    "polyline" : {
                      "points" : "qznG{y_yRKCCACCAACAIEYD[Ba@B[?UAcDM"
                    },
                    "start_location" : {
                      "lat" : 1.3919294,
                      "lng" : 103.8788555
                    },
                    "travel_mode" : "DRIVING"
                  }
                ],
                "via_waypoint" : []
              }
            ],
            "overview_polyline" : {
              "points" : "os{FkomxRMDe@DcADc@LULeEhCaCdA_@Vw@p@]b@[h@@@?B?DABGFK@IECKBIpA}A~@u@tCwA|DcCn@[j@GbAEb@K`@Wq@o@_@U]Se@Ku@K{@Go@E_@GYEQIMSB_@ZG~Di@\\KVMbEaEb@Q|@wAhHmM~BsEv@sAnCuDdB{B|AcCz@}AxD_InAaCb@w@hDyFhCgEd@}@^q@Z{@ZaAVsAT{A?EBu@TeHXaRZyLRuHVcFn@oFl@sDf@}AfAaDjA{B|HwN@CVe@~AcD|@gBfAwC^qCPmCL_HFs@^qBJa@T_AXu@pC{FNq@N_ABOBqAEy@Gk@Ok@i@qAo@{@{@s@}BsAWQm@_@}AmAoBkB}@cAq@_AiBgDg@gA}B_HuAyEqAsEc@aAYk@_@m@{@{@y@k@mAs@uBgAiAy@q@s@GGy@uAwD_Io@cAqAeBe@e@eBy@qB}@}@e@cC}A]U}C_BuB{@gC_A{CkAo@MsAOqA?gA@}DXmDVsEZ{FFiFJ}ANmAXe@Pc@R[Rs@v@s@t@uDtEyBfCcAv@kB|@}@VeALqBJsACkAM_AUoA[iDkC}@oAaBoCiCqCaCcC_AaAaAs@i@YUGcAWiJ{As@K}Ai@MEiC}@{@[c@Wc@U{BeBy@q@uA{AcBiCcAyB}CmIuB_HaB{Ek@sAISUa@Q[oCgFoBoC{AaBcDqCsFaF{PmQaB_BaAw@oAo@uBu@kBg@oAU}@Gs@C]IiACg@?wBBqGBuDH{EJcFHwGB_FJ}BNk@FqAT}AXmCn@iQhEMDu@RwHlBgJ|BsAd@}@NeZ|HwF|@mAJwBFgDBeA?GAO?}DWsBSoEaAw@OuHmByT{FmAUuEgAoO{D}B[q@GiCMg@@y@Bw@FiAPkB^_D`AcMnEkD`AwFhA_AJYD_@DeF`@kCLmCBcUSkEEgJLyMLcBB[Lq@HyCVsBPu@Ai@Ia@Ki@YKGi@A@IBOh@qDnAsHfBiK\\}AfCaN`CyMX{AMQWi@GEoAYa@M[Cs@G_Ia@SA@[FeCNyCPyCh@}Lb@uKQ{A_BuFgAmDq@yBOESMu@H}@ByDO"
            },
            "summary" : "CTE",
            "warnings" : [],
            "waypoint_order" : []
          }
        ],
        "status" : "OK"
      }
    }
  })
.controller('routeDirectionsController', function($scope, $sce, directionsMock){
    $scope.directions = directionsMock.directions.routes[0].legs[0].steps;
    $scope.renderHTML = function(text){
      return $sce.trustAsHtml(text);
    };
  });
